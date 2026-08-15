## Duolingo Datathon - Predicting Users' Return Time Probability using
#### Survival Analysis

This project aims to predict user retention on Duolingo by examining the
factors influencing the delay of their return, using Survival Analysis
techniques.

The primary dataset used is learning_traces.13m.csv, containing detailed
information about user learning events. Key variables include:

`p_recall`: Empirical recall probability during the session 
`timestamp`: Absolute time of the recall event 
`delta`: Time elapsed since the previous exposure of the same lexeme by the same user 
`user_id`: Categorical anonymized user identifier 
`learning_language`: Target language beinglearned 
`ui_language`: User (native) interface language 
lexeme_id`: Unique identifier for lexical item 
`lexeme_string`: Transformed Form of Word/Base Word 
`history_seen`: Total number of times user has seen this lexeme before this event 
`history_correct`: Number of times previously answered
`correctly session_seen`: Number of times seen within the current session
`session_correct`: Correct answers within the current session

**Step 1-3**: Defining Session and Data Preprocessing 1. Data Loading and
Initial Transformation: The dataset is loaded, and the timestamp column
is converted to datetime objects, with a separate date column extracted.
2. Grouping by User and Time: The data is sorted by user_id and datetime
to facilitate session identification. 3. Session Identification: User
sessions are defined based on a time cutoff. If the time difference
between consecutive events for a user exceeds 15 minutes, a new session
is considered to have started. A session_id is assigned, and
session_size (number of events in a session) is calculated.

**Step 4**: Aggregating Data to accommodate for Survival Analysis The
detailed event-level data is aggregated to a session-level DataFrame
(session_df). For each session, the following aggregates are computed:
session_size: Number of events in the session. avg_recall: Mean recall
probability. avg_delta: Mean time elapsed since previous exposure.
avg_history_seen, avg_history_correct: Averages of history metrics.
avg_session_seen, avg_session_correct: Averages of current session
metrics. session_start, session_end: Start and end timestamps of the
session.

Additional features are engineered, clearly distinguishing between
behavorial and performance variables: next_session_start: The start time
of the user's subsequent session. time_to_next_session: The duration (in
minutes) between the current session's start and the next session's
start. This is the duration variable for survival analysis. event: A
binary indicator (1 if a next session occurred, 0 if censored, i.e., no
next session observed within the dataset timeframe). hour, weekday,
is_weekend: Temporal features extracted from session_start.
interval_hours: time_to_next_session converted to hours, used as the
duration column in the model. history_ratio, session_ratio: Ratios of
correct answers to seen items. prev_gap: The interval_hours of the
user's previous session, indicating the gap before the current session.
session_number: Sequential number of the session for each user.

**Step 5**: Survival Analysis Model (Cox Proportional Hazards) Model
Building 1. Feature Selection: A set of features (session_size,
avg_delta, hour, history_ratio, session_ratio, prev_gap, session_number,
is_weekend) are chosen as predictors. 2. Train-Test Split: The dataset
is split into training and testing sets based on session_start (80% for
training, 20% for testing) to simulate predicting future behavior. 3.
Model Fitting: A Cox Proportional Hazards (CoxPH) model from the
lifelines library is fitted to the training data, using interval_hours
as the duration and event as the event indicator.

#### Model Evaluation
Concordance Index (C-index): The model's discriminative
power is evaluated using the C-index on both training and test sets. A
C-index of 0.61 suggests reasonable discriminatory ability. Prediction
of Return Probability: The model can predict the probability of a user
returning within a specific timeframe (e.g., 24 hours). Survival Curves:
Visualizations are generated to show: - The baseline survival curve for
an 'average' session. - Survival curves comparing 'short-burst'
vs. 'long-session' learners based on session_size. - Survival curves
comparing users with 'high' vs. 'low' history_ratio. Hazard Ratios: A
plot of hazard ratios indicates how each feature influences the
instantaneous return rate (e.g., prev_gap and session_number tend to
increase the hazard of return, while avg_delta decreases it). Accuracy &
AUC for 24h Return Prediction: The model's performance in predicting
return within 24 hours is assessed using accuracy (0.616) and AUC
(0.663), and a confusion matrix is provided. Distribution of 24-Hour
Return Probability: A histogram visualizes the distribution of predicted
return probabilities.

**Business Implications**: User-Risk Segmentation Users are categorized into
different risk segments based on their history_ratio and session_ratio
from their last session, along with their session_number. This
classification aims to identify user groups with different retention
behaviors:

#### Findings
New users: Users with 3 or fewer sessions. High momentum: Users with
high history_ratio and high session_ratio. Fragile momentum: Users with
high history_ratio but low session_ratio. At-risk: Users with low
history_ratio and low session_ratio. Balanced momentum: Users with low
history_ratio but high session_ratio. A pie chart visualizes the
distribution of users across these risk categories, providing actionable
insights for targeted interventions.

#### Conclusion
This project demonstrates how survival analysis can be
effectively applied to predict user retention for Duolingo. By
understanding both the behavioral and performance factors that influence
return behavior and segmenting users based on their risk profiles,
targeted strategies can be developed by the app to improve user
engagement and retention, thus boosting their financial performance.
