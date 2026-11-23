import { Question } from '../types';

export interface DataTechnicalQuestionDetail extends Question {
  subCategory?: string;
  idealAnswer: string;
  rubricCriteria: string[];
  followUpQuestions?: string[];
  codeSnippet?: string;
}

/**
 * Curated, comprehensive training data and question bank for Data Science,
 * Machine Learning, Data Engineering, and Analytics Technical Interviews.
 */
export const DATA_SCIENCE_TECHNICAL_QUESTIONS: DataTechnicalQuestionDetail[] = [
  // ==========================================
  // 1. MACHINE LEARNING & DEEP LEARNING
  // ==========================================
  {
    id: 'data_ml_1',
    type: 'technical',
    category: 'Machine Learning & Model Optimization',
    subCategory: 'Bias-Variance & Regularization',
    difficulty: 'Intermediate',
    question: 'How do you detect and mitigate the Bias-Variance tradeoff in supervised learning? Explain mathematically how L1 (Lasso) and L2 (Ridge) regularization impact model weights.',
    explanation: 'Demonstrates deep understanding of generalization error, loss functions, weight penalties, and feature sparsity.',
    idealAnswer: `Total expected generalization error decomposes into: E[(y - f̂(x))²] = Bias[f̂(x)]² + Var[f̂(x)] + σ² (irreducible noise).
- High Bias (Underfitting): Model is overly simplistic and cannot capture underlying trends. Detected when training error is high and validation error is similarly high. Mitigated by increasing model complexity, adding non-linear features, or reducing regularization.
- High Variance (Overfitting): Model fits training noise. Detected when training error is very low but validation error is significantly higher. Mitigated by cross-validation, pruning, data augmentation, dropout, and regularization.

Mathematical impact of L1 vs L2:
- L2 Regularization (Ridge): Adds penalty term λ ∑ w_i² to the loss function. The gradient update shrinks weights by a proportional factor (1 - 2αλ), decaying weights towards zero smoothly without setting them strictly to zero (weight decay). Geometrically, the spherical constraint surface touches loss contours along curved surfaces.
- L1 Regularization (Lasso): Adds penalty term λ ∑ |w_i|. The subgradient subtracts a constant sign(w_i) at each step. Geometrically, the diamond-shaped constraint has sharp corners on coordinate axes; hence loss contours often intersect at w_i = 0, inducing strict parameter sparsity (automatic feature selection).`,
    rubricCriteria: [
      'States the exact error decomposition formula (Bias² + Variance + Irreducible Error)',
      'Identifies training vs validation curve divergence as the diagnostic sign of high variance',
      'Explains L1 leads to sparse weights (feature selection) due to diamond constraint geometry',
      'Explains L2 shrinks weights uniformly without zeroing them due to circular/spherical geometry'
    ],
    followUpQuestions: [
      'When would you prefer ElasticNet over pure Lasso or Ridge?',
      'Why is feature scaling (e.g. StandardScaler) strictly required before applying L1 or L2 regularization?'
    ],
    codeSnippet: `# Scikit-Learn Regularization formulation
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', ElasticNet(alpha=0.1, l1_ratio=0.5, max_iter=2000))
])`
  },
  {
    id: 'data_ml_2',
    type: 'technical',
    category: 'Machine Learning & Model Optimization',
    subCategory: 'Ensemble Learning',
    difficulty: 'Intermediate',
    question: 'Compare Bagging (Random Forest) and Boosting (XGBoost/LightGBM). How do they differ in variance reduction vs bias reduction, and how do they handle tree depth?',
    explanation: 'Covers core ensemble methods, parallel vs sequential tree generation, and hyperparameters controlling overfitting.',
    idealAnswer: `Bagging vs Boosting fundamentals:
1. Mechanism:
   - Bagging (Bootstrap Aggregating, e.g. Random Forest): Trains independent base learners in parallel on bootstrap samples (random sampling with replacement) and random feature subsets. Predictions are averaged (regression) or majority-voted (classification).
   - Boosting (e.g. XGBoost, LightGBM, CatBoost): Trains sequential trees where each subsequent tree fits on the pseudo-residuals (negative gradient of the loss function) of the preceding ensemble.

2. Error Reduction:
   - Bagging primarily reduces VARIANCE: Since individual deep trees are low-bias but high-variance, averaging multiple de-correlated trees dampens variance without increasing bias: Var(ensemble) = ρσ² + ((1-ρ)/n)σ².
   - Boosting primarily reduces BIAS (and variance via shrinkage rate η): It starts with weak learners (shallow trees) and iteratively drives down training residuals.

3. Tree Depth & Hyperparameters:
   - Random Forest typically uses DEEP, unpruned trees (low bias individual estimators).
   - XGBoost uses SHALLOW trees (max_depth 3-6) to maintain weak learner status and prevent rapid overfitting, guarded by learning rate (shrinkage) and min_child_weight.`,
    rubricCriteria: [
      'Clearly states Bagging builds trees in parallel to reduce variance',
      'Clearly states Boosting builds trees sequentially on residuals to reduce bias',
      'Explains why Random Forest uses deep trees while Gradient Boosting uses shallow trees',
      'Mentions XGBoost regularization terms (gamma, lambda) or shrinkage rate'
    ],
    followUpQuestions: [
      'How does LightGBM achieve much faster training speed than standard XGBoost? (Histogram binning & GOSS/EFB)',
      'How does out-of-bag (OOB) error estimation work in Random Forest without a separate validation set?'
    ]
  },
  {
    id: 'data_ml_3',
    type: 'technical',
    category: 'Deep Learning & Neural Architectures',
    subCategory: 'Transformers & Attention',
    difficulty: 'Advanced',
    question: 'Explain the mathematical formulation of Scaled Dot-Product Self-Attention in Transformers. Why is scaling by √d_k essential, and what advantages does self-attention have over Recurrent Neural Networks (RNNs)?',
    explanation: 'Examines deep neural network architectures, attention mechanisms, numerical stability, and computational parallelization.',
    idealAnswer: `Mathematical Formulation:
Given input representation matrix X, we compute three projections:
  Query (Q) = X · W_Q
  Key (K) = X · W_K
  Value (V) = X · W_V

Attention(Q, K, V) = Softmax( (Q · K^T) / √d_k ) · V
where d_k is the dimension of the key vectors.

Why scaling by √d_k is essential:
Assuming components of Q and K are independent random variables with zero mean and unit variance, their dot product has mean 0 and variance d_k. For large d_k (e.g. 64 or 128), dot products grow large in magnitude, pushing the Softmax function into regions with extremely small gradients (vanishing gradients). Dividing by √d_k scales the variance back down to 1, preserving healthy gradient flow during backpropagation.

Advantages over RNNs/LSTMs:
1. Parallel Execution: RNNs require sequential step-by-step processing h_t = f(h_{t-1}, x_t), creating an O(n) computational path that cannot be parallelized across sequence length. Transformers compute all token relationships simultaneously via matrix multiplications.
2. Constant Path Length: Self-attention has an O(1) path length between any pair of arbitrary tokens regardless of distance, mitigating catastrophic forgetting of long-range context seen in RNNs.
3. Expressive Multi-Head Attention: Allows the model to jointly attend to information from different representation subspaces at different positions.`,
    rubricCriteria: [
      'Writes or correctly explains Softmax(Q K^T / sqrt(d_k)) V',
      'Explains the variance calculation of the dot product and why softmax saturates without scaling',
      'Highlights parallel training capability vs RNN sequential recurrence bottleneck',
      'Mentions O(1) maximum path length for capturing long-range dependencies'
    ],
    followUpQuestions: [
      'What is the computational complexity of standard self-attention relative to sequence length n? (O(n²))',
      'How do FlashAttention or Linear Attention approximations mitigate the quadratic complexity?'
    ],
    codeSnippet: `import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    # Compute attention scores: (batch, heads, seq_len, seq_len)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    weights = F.softmax(scores, dim=-1)
    return torch.matmul(weights, V), weights`
  },

  // ==========================================
  // 2. DATA ENGINEERING & APACHE SPARK
  // ==========================================
  {
    id: 'data_de_1',
    type: 'technical',
    category: 'Data Engineering & Apache Spark',
    subCategory: 'Distributed Processing',
    difficulty: 'Advanced',
    question: 'In Apache Spark, explain the difference between Narrow and Wide Dependencies. What causes data skew during distributed joins, and how do you resolve it in production?',
    explanation: 'Core distributed computing question testing Spark internals, catalyst optimizer, shuffling, and data skew mitigation.',
    idealAnswer: `1. Narrow vs Wide Dependencies:
- Narrow Dependency: Each partition of the parent RDD/DataFrame is used by at most one partition of the child RDD (e.g. map(), filter(), flatMap()). Can be executed in-memory as a pipelined single stage across cluster workers without network I/O.
- Wide Dependency: Multiple child partitions depend on data from a single parent partition, requiring data to be partitioned across all executors (e.g. groupByKey(), reduceByKey(), join(), distinct()). This triggers an expensive SHUFFLE stage boundary, involving disk spills and network transmission.

2. Causes of Data Skew:
Data skew occurs when uneven distribution of join/grouping keys causes a single partition to hold an overwhelmingly large share of records. As a result, one executor task gets stuck working on 90% of the data (the "long tail" straggler task) while other executors finish immediately.

3. Production Remedies:
- Broadcast Hash Join: If one dataset is small (<10-100MB), use broadcast(small_df). Eliminates the shuffle completely by shipping the small table to every executor.
- Salting Keys: Append a random suffix (e.g. concat(key, '_', rand(1, 10))) to skewed keys on the large table and explode matching keys on the dimension table. This distributes the heavy key across 10 distinct partitions.
- Adaptive Query Execution (AQE): Enable spark.sql.adaptive.skewJoin.enabled = true (Spark 3.x+). Spark automatically splits skewed partitions into smaller sub-partitions dynamically during execution.
- Repartitioning / Coalescing: Adjust spark.sql.shuffle.partitions to appropriate granularity (e.g., matching cluster cores and partition sizes of ~100-200MB).`,
    rubricCriteria: [
      'Contrasts Narrow (no shuffle, pipelined) vs Wide (shuffle boundary, network I/O)',
      'Identifies straggler executor tasks as the symptom of key skew',
      'Presents Broadcast Join for small tables to eliminate shuffle',
      'Explains Key Salting (adding random prefixes/suffixes) to distribute skewed partitions',
      'Mentions Spark 3 AQE (Adaptive Query Execution) skew join optimization'
    ],
    followUpQuestions: [
      'What is the difference between repartition() and coalesce() in Spark?',
      'How does Spark handle executor Out-Of-Memory (OOM) errors caused by shuffle spills?'
    ],
    codeSnippet: `# Spark PySpark Salting Example for Skewed Join
from pyspark.sql import functions as F

# Add salt 0-9 to skewed table
SALT_FACTOR = 10
skewed_df = large_df.withColumn("salt", (F.rand() * SALT_FACTOR).cast("int"))
skewed_df = skewed_df.withColumn("salted_join_key", F.concat(F.col("user_id"), F.lit("_"), F.col("salt")))

# Replicate dimension table with all possible salt values
dim_df = dim_df.withColumn("salt_array", F.array([F.lit(i) for i in range(SALT_FACTOR)]))
dim_exploded = dim_df.withColumn("salt", F.explode("salt_array"))
dim_exploded = dim_exploded.withColumn("salted_join_key", F.concat(F.col("user_id"), F.lit("_"), F.col("salt")))

result = skewed_df.join(dim_exploded, "salted_join_key")`
  },
  {
    id: 'data_de_2',
    type: 'technical',
    category: 'Data Engineering & Pipelines',
    subCategory: 'Streaming vs Batch & Architecture',
    difficulty: 'Intermediate',
    question: 'Compare Lambda vs Kappa data architectures. When would you use Apache Kafka + Spark Streaming over Apache Airflow + Snowflake batch pipelines?',
    explanation: 'Architectural evaluation of real-time streaming vs scheduled batch ELT/ETL paradigms.',
    idealAnswer: `1. Lambda Architecture:
Maintains two separate processing layers:
- Speed Layer (Stream processing, low latency, e.g. Kafka + Flink/Storm): Computes real-time views with approximate/eventual consistency.
- Batch Layer (Batch processing, high latency, e.g. Spark/Hadoop + Data Lake): Computes authoritative, perfectly reconciled views periodically.
- Serving Layer: Merges query responses from both speed and batch views.
- Drawback: Dual codebases and maintenance overhead for business logic in two frameworks.

2. Kappa Architecture:
Eliminates the separate batch layer. Treats ALL data as an immutable, continuous stream through an append-only distributed log (e.g. Apache Kafka / Redpanda). Historical reprocessing is achieved simply by replaying the log from an earlier offset through the same streaming engine (e.g. Apache Flink, Spark Structured Streaming).

3. Selection Criteria (Kafka + Streaming vs Airflow + Snowflake Batch):
- Use Kafka + Spark/Flink Streaming when:
  * Latency SLAs are sub-second to low-seconds (e.g. fraud detection, live anomaly alerts, dynamic pricing, real-time telemetry).
  * Data arrives as a continuous event stream with out-of-order events requiring watermarking and sliding window aggregations.
- Use Airflow + Snowflake Batch when:
  * Latency requirements are hourly, daily, or multi-hourly (e.g. financial reporting, executive dashboards, regulatory compliance).
  * Workloads involve complex multi-table SQL joins across terabytes of historical dimension records where batch columnar scanning and cost efficiency dominate.`,
    rubricCriteria: [
      'Accurately defines Lambda (speed + batch layers) vs Kappa (streaming-first, single log replay)',
      'Identifies code duplication as Lambda biggest challenge',
      'Contrasts sub-second event requirements (fraud/alerts) with scheduled business reporting',
      'Mentions event-time processing, watermarks, or exactly-once delivery semantics'
    ],
    followUpQuestions: [
      'How does Kafka guarantee message ordering, and what are the limitations?',
      'How do you achieve Exactly-Once Semantics (EOS) in a Kafka-to-Spark pipeline?'
    ]
  },

  // ==========================================
  // 3. SQL & DATA MODELING
  // ==========================================
  {
    id: 'data_sql_1',
    type: 'technical',
    category: 'SQL & Data Warehousing',
    subCategory: 'Window Functions & Optimization',
    difficulty: 'Intermediate',
    question: 'What is the operational difference between ROW_NUMBER(), RANK(), and DENSE_RANK()? Write a SQL query to find the top 2 highest-earning employees in every department, including department running total.',
    explanation: 'Tests mastery of analytical SQL window functions, partition frames, and edge cases with tied values.',
    idealAnswer: `1. Operational Difference on Tied Values:
Suppose salaries in a department are: $100k, $100k, $80k:
- ROW_NUMBER(): Assigns unique sequential integers (1, 2, 3) arbitrarily breaking ties based on internal storage/index order.
- RANK(): Assigns equal ranks to identical values but SKIPS subsequent ranks to preserve rank count: (1, 1, 3).
- DENSE_RANK(): Assigns equal ranks to identical values WITHOUT skipping subsequent ranks: (1, 1, 2).

2. SQL Implementation with CTE & Running Total:
We use DENSE_RANK() so that if multiple employees tie for the highest salary, they are both included without skipping the second tier.`,
    rubricCriteria: [
      'Explicitly explains tie-handling: ROW_NUMBER (unique 1,2,3), RANK (gaps 1,1,3), DENSE_RANK (no gaps 1,1,2)',
      'Uses Common Table Expression (CTE) or subquery to filter window ranks (window functions prohibited in WHERE)',
      'Applies SUM() OVER (PARTITION BY ... ORDER BY ...) for running total correctly'
    ],
    followUpQuestions: [
      'Why cannot window functions be used directly inside a WHERE clause in SQL? (Execution order: WHERE executes before SELECT/WINDOW)',
      'What is the difference between ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW vs RANGE BETWEEN?'
    ],
    codeSnippet: `WITH RankedSalaries AS (
    SELECT 
        employee_id,
        first_name,
        last_name,
        department_id,
        salary,
        DENSE_RANK() OVER (
            PARTITION BY department_id 
            ORDER BY salary DESC
        ) AS salary_rank,
        SUM(salary) OVER (
            PARTITION BY department_id 
            ORDER BY salary DESC
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS dept_running_salary_total
    FROM employees
)
SELECT 
    department_id,
    employee_id,
    first_name,
    salary,
    salary_rank,
    dept_running_salary_total
FROM RankedSalaries
WHERE salary_rank <= 2
ORDER BY department_id, salary_rank;`
  },
  {
    id: 'data_sql_2',
    type: 'technical',
    category: 'SQL & Data Warehousing',
    subCategory: 'Data Modeling & Dimensional Design',
    difficulty: 'Advanced',
    question: 'Compare Star Schema vs Snowflake Schema in Data Warehousing. How do Slowly Changing Dimensions (SCD Type 1, Type 2, and Type 3) preserve historical auditability in dimensional models?',
    explanation: 'Covers dimensional Kimball modeling, OLAP query performance, join normalization, and SCD tracking.',
    idealAnswer: `1. Star Schema vs Snowflake Schema:
- Star Schema: Contains a central Fact table surrounded by de-normalized Dimension tables directly connected via foreign keys.
  * Pros: Fewer table joins, faster OLAP query execution, simple query authoring for BI tools.
  * Cons: Data redundancy in dimension tables.
- Snowflake Schema: Dimension tables are normalized into multiple related sub-tables (e.g. DimProduct joins to DimSubCategory which joins to DimCategory).
  * Pros: Eliminates data redundancy, reduces storage.
  * Cons: Requires multi-level joins, degrading analytical query performance on large data warehouses like Snowflake/BigQuery.

2. Slowly Changing Dimensions (SCD):
How dimensions reflect changes over time (e.g. candidate changes address or job title):
- SCD Type 1 (Overwrite): Updates the existing record in-place with the new value. Historical state is permanently overwritten. Used when correcting spelling errors or when history is irrelevant. Zero audit trail.
- SCD Type 2 (Add New Row): Inserts a new row with a surrogate key, retaining the original row. Uses start_date, end_date, and is_current boolean flag to track record validity intervals. Fully preserves historical auditability for point-in-time snapshot reporting.
- SCD Type 3 (Add New Column): Adds a previous_value column to the existing row. Tracks only the immediate prior state, losing older historical iterations.`,
    rubricCriteria: [
      'Contrasts Star (denormalized, fast joins) vs Snowflake (normalized, multiple joins)',
      'Accurately distinguishes SCD Type 1 (overwrite), Type 2 (new row with dates/flags), Type 3 (new column)',
      'Identifies SCD Type 2 as the industry standard for historical tracking in dimensional data warehouses',
      'Mentions surrogate keys vs natural keys'
    ],
    followUpQuestions: [
      'In modern cloud data warehouses like Snowflake or BigQuery, why is Star Schema generally preferred over Snowflake schema? (Columnar engines optimize scan width; joins remain the primary bottleneck)',
      'What is an SCD Type 4 or Type 6 hybrid pattern?'
    ]
  },

  // ==========================================
  // 4. STATISTICAL EVALUATION & A/B TESTING
  // ==========================================
  {
    id: 'data_stat_1',
    type: 'technical',
    category: 'Statistical Modeling & Evaluation',
    subCategory: 'Imbalanced Datasets & Metrics',
    difficulty: 'Intermediate',
    question: 'In a real-world Credit Card Fraud Detection model with 99.8% legitimate transactions and 0.2% fraud, why is Accuracy dangerous? Which metrics, thresholding strategies, and sampling techniques do you apply?',
    explanation: 'Tests real-world evaluation acumen for severely imbalanced classifications, confusion matrix metrics, and cost-sensitive learning.',
    idealAnswer: `1. Why Accuracy is Deceptive:
A naive dummy model predicting "Legitimate" 100% of the time achieves 99.8% Accuracy while missing 100% of fraudulent activities. In critical tasks (fraud, cancer diagnosis, cyber intrusion), the cost of False Negatives (FN) is catastrophic compared to False Positives (FP).

2. Appropriate Evaluation Metrics:
- Precision = TP / (TP + FP): Of all transactions flagged as fraud, how many actually are fraud? High precision avoids blocking innocent cardholders.
- Recall (Sensitivity) = TP / (TP + FN): Of all actual frauds, how many did the model catch? High recall catches maximum fraud dollars.
- F1-Score / F_beta: Harmonic mean of precision and recall. If recall is prioritized over precision, use F_2 score.
- PR-AUC (Precision-Recall Area Under Curve): Superior to ROC-AUC for severe imbalance because ROC-AUC uses False Positive Rate (FP / (FP + TN)), which is artificially compressed by massive TN counts.

3. Remediation Techniques:
- Cost-Sensitive Learning: Apply class weights in loss functions (e.g. scale_pos_weight in XGBoost or class_weight='balanced' in Scikit-Learn) penalizing FN errors heavily.
- Sampling Strategies:
  * SMOTE (Synthetic Minority Over-sampling Technique): Interpolates synthetic examples along line segments connecting k-nearest minority neighbors.
  * Under-sampling: NearMiss or Tomek Links to discard redundant majority instances.
  * Note: Oversampling must be done ONLY on the training split, NEVER on validation/test splits (data leakage).
- Dynamic Threshold Tuning: Instead of default 0.5 probability cutoff, sweep PR curve to set threshold based on business cost matrix (Expected Dollar Loss = C_FP · FP + C_FN · FN).`,
    rubricCriteria: [
      'Explains the Dummy Classifier Accuracy Paradox (99.8% accuracy with 0% recall)',
      'Selects PR-AUC and Precision/Recall/F1 over standard ROC-AUC and Accuracy',
      'Discusses threshold tuning via business cost-benefit trade-off rather than arbitrary 0.5 cutoff',
      'Mentions SMOTE or class_weight, emphasizing that resampling must not leak into validation sets'
    ],
    followUpQuestions: [
      'Why does computing SMOTE before splitting into train/test cause fatal data leakage?',
      'How does Focal Loss dynamically adjust cross-entropy gradients for hard vs easy examples?'
    ]
  },
  {
    id: 'data_stat_2',
    type: 'technical',
    category: 'Statistical Modeling & Evaluation',
    subCategory: 'A/B Testing & Hypothesis Testing',
    difficulty: 'Intermediate',
    question: 'Walk through designing an end-to-end A/B test for an e-commerce checkout page. How do you calculate sample size, ensure statistical power, prevent p-hacking, and interpret p-values?',
    explanation: 'Evaluates experimentation fundamentals, Type I & Type II errors, sample size calculation, and multi-testing corrections.',
    idealAnswer: `1. Hypothesis Formulation:
- Null Hypothesis (H_0): Conversion rate of Variant B equals Conversion rate of Control A (p_B = p_A).
- Alternative Hypothesis (H_1): Variant B conversion rate is strictly greater than Control A (p_B > p_A).

2. Sample Size & Statistical Power:
Sample size per variant n depends on:
- Significance Level (α, Type I error): Typically 0.05 (5% chance of false positive).
- Statistical Power (1 - β, where β is Type II error): Typically 0.80 or 0.90 (80-90% probability of detecting true effect).
- Minimum Detectable Effect (MDE, δ): Smallest relative lift meaningful to the business (e.g. +2% relative increase from 5.0% to 5.1%).
Formula: n ≈ 2 · (Z_{α/2} + Z_β)² · p(1 - p) / δ²
Running tests without reaching requisite n leads to underpowered studies.

3. Avoiding P-Hacking & Pitfalls:
- Peeking Problem (Repeated Testing): Checking p-values daily and stopping early inflates false positive rate up to 30%+. Use Sequential Testing (e.g. Wald's SPRT) or enforce pre-determined sample size before checking.
- Multiple Comparison Correction: When testing multiple variants (A/B/C/n), apply Bonferroni correction (α / k) or False Discovery Rate (Benjamini-Hochberg).
- Novelty Effect: Allow a burn-in period of 1-2 full weeks to capture full day-of-week seasonality cycles and filter out fleeting user curiosity.

4. P-Value Interpretation:
A p-value is the probability of observing test statistics as extreme or more extreme than the observed data, assuming the Null Hypothesis H_0 is true. It is NOT the probability that H_0 is true! If p < α and sample size is met, reject H_0 and verify practical business impact against confidence intervals.`,
    rubricCriteria: [
      'States Null and Alternative Hypotheses clearly',
      'Defines components of sample size: Alpha (Type I), Beta/Power (Type II), and MDE (Minimum Detectable Effect)',
      'Identifies the Peeking Problem and mentions Sequential Testing as mitigation',
      'Correctly defines p-value (probability of observed data given H_0 is true, not P(H_0))'
    ],
    followUpQuestions: [
      'How does CUPED (Controlled-Experiment using Pre-Experiment Data) reduce variance in A/B tests?',
      'When would you switch from a fixed A/B test to a Multi-Armed Bandit (e.g. Thompson Sampling)?'
    ]
  },

  // ==========================================
  // 5. MLOPS & SYSTEM DESIGN
  // ==========================================
  {
    id: 'data_mlops_1',
    type: 'technical',
    category: 'MLOps & System Design',
    subCategory: 'Model Serving & Drift Detection',
    difficulty: 'Advanced',
    question: 'How do you distinguish between Data Drift and Concept Drift in production? Design an automated monitoring architecture to detect drift and trigger continuous retraining.',
    explanation: 'Production MLOps question covering real-time model monitoring, statistical drift tests, and CI/CD/CT retraining loops.',
    idealAnswer: `1. Concept Drift vs Data Drift:
- Data Drift (Covariate Shift): The distribution of input features P(X) changes over time, while conditional probability P(Y | X) remains constant. (e.g., users start shopping on mobile apps rather than desktop browsers, shifting device and screen resolution feature distributions).
- Concept Drift: The underlying relationship between features and target labels P(Y | X) changes over time, even if input distribution P(X) looks similar. (e.g., sudden macroeconomic inflation or pandemic altering consumer purchasing behavior for given income brackets).
- Prior Probability Shift: Target label distribution P(Y) shifts over time.

2. Statistical Drift Detection Tests:
- Numerical Features:
  * Kolmogorov-Smirnov (KS) test: Non-parametric two-sample test comparing empirical cumulative distribution functions (eCDF).
  * Population Stability Index (PSI): Compares distribution bins between baseline and production; PSI > 0.2 indicates significant drift.
  * Wasserstein Distance (Earth Mover's Distance).
- Categorical Features:
  * Chi-Square Goodness-of-Fit test.
  * Jensen-Shannon Divergence.
- Performance Drift: Track live ground-truth labels (delayed feedback loop) against predicted scores to detect drop in F1/ROC-AUC.

3. Automated Production Architecture:
- Logging Layer: Asynchronous message queue (Kafka) capturing live model inference payloads (input features, model version, predicted score, latency).
- Storage & Baseline Store: Raw inputs dumped into Data Lake / Feature Store (Feast). Baseline distribution profiles computed on training set stored in metadata store.
- Drift Worker: Scheduled service (Evidently AI / Great Expectations / custom PySpark job) computing daily KS-test and PSI metrics.
- Alerting & Trigger: If PSI > 0.25 on critical features, trigger webhook to Airflow/Kubeflow DAG.
- Continuous Retraining Pipeline:
  1. Pull latest window of labeled ground truth.
  2. Run automated validation checks.
  3. Retrain candidate model and run champion-vs-challenger evaluation.
  4. If candidate beats current champion on holdout benchmarks, register artifact in MLflow and deploy via Canary / Shadow rollout.`,
    rubricCriteria: [
      'Distinguishes Data Drift (P(X) shifts) from Concept Drift (P(Y|X) shifts)',
      'Names standard statistical drift metrics (KS test, PSI, Earth Mover Distance, Chi-Square)',
      'Outlines an end-to-end architecture (Kafka logging -> Feature Store -> Drift Evaluator -> Alert -> Retrain DAG)',
      'Mentions safe deployment strategies (Canary, Shadow deployment, Champion-Challenger)'
    ],
    followUpQuestions: [
      'How do you monitor for concept drift when ground truth labels are delayed by 30 to 90 days (e.g. loan defaults)?',
      'What is the difference between Batch feature stores and Online low-latency feature stores (e.g. Feast with Redis)?'
    ]
  },
  {
    id: 'data_mlops_2',
    type: 'technical',
    category: 'MLOps & System Design',
    subCategory: 'High-Throughput ML Serving',
    difficulty: 'Advanced',
    question: 'Design an end-to-end ML inference service serving 5,000 queries per second (QPS) with p99 latency under 20ms. Discuss framework choices, caching, batching, and horizontal autoscaling.',
    explanation: 'System design for production deep learning / ML model serving at scale.',
    idealAnswer: `1. High-Level Architecture Components:
- Load Balancer: AWS ALB / NGINX distributing traffic across Kubernetes (EKS) worker pods.
- API Gateway / Model Server: FastAPI with Uvicorn (asynchronous event loop) or Triton Inference Server / TorchServe.
- In-Memory Cache: Redis cluster caching predictions for frequent duplicate query vectors with TTL.
- Model Engine: ONNX Runtime or TensorRT compiled models with FP16/INT8 quantization to maximize GPU/CPU tensor throughput.
- Feature Retrieval: Low-latency in-memory feature store (Feast backed by Redis) with sub-3ms key-value lookups.

2. Latency & Throughput Optimization:
- Model Compilation: Export PyTorch/TensorFlow models to ONNX and optimize using TensorRT/OpenVINO to fuse layers (Conv+BatchNorm+ReLU) and quantize weights from FP32 to FP16/INT8, reducing inference latency by 3-5x.
- Dynamic Micro-Batching: Triton Inference Server buffers incoming concurrent requests over a 2-5ms window and runs GPU batch tensor operations together, boosting GPU compute efficiency while staying within p99 SLAs.
- Async I/O: Ensure feature lookups and logging are non-blocking (e.g. async Redis, fire-and-forget logging to Kafka via background coroutine).

3. Autoscaling & Reliability:
- Kubernetes HPA (Horizontal Pod Autoscaler): Scales pods based on custom metrics (request latency and queue depth) rather than plain CPU/Memory.
- Graceful Degradation: If latency spikes, fallback to a fast lightweight heuristics model (e.g. linear model or cached default recommendation).
- Health Probes: Separate /live and /ready endpoints ensuring traffic is only routed once model weights are warm in memory.`,
    rubricCriteria: [
      'Proposes dedicated model runtime (Triton, ONNX Runtime, TensorRT) over naive Flask',
      'Mentions weight quantization (FP32 -> FP16/INT8) and operator fusion',
      'Explains dynamic micro-batching to saturate GPU compute without violating SLA',
      'Includes low-latency feature store (Redis) and horizontal pod autoscaling'
    ],
    followUpQuestions: [
      'Why does pure Python GIL bottleneck multi-threaded serving, and how do multi-process workers (Uvicorn workers) or C++ runtimes bypass it?',
      'How does model distillation (teacher-student network) help reduce latency for transformer models?'
    ]
  }
];
