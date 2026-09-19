import pandas as pd

df = pd.read_csv("data/hillstrom.csv")
print(df.columns.tolist())
print(df.head())
print(df["offer"].value_counts())
print(df["conversion"].mean())
print(df.groupby("offer")["conversion"].agg(["count", "mean"]))