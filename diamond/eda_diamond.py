"""EDA for seaborn's diamonds dataset
- computes descriptive statistics (>=5)
- creates >=5 visualizations and saves them to images/
- for each visualization, includes a pivot/crosstab table below it
- writes a consolidated markdown report to analysis.md
"""
import os
from pathlib import Path

# Import dependencies with a clear error message if missing
import importlib
_requirements = {
    'pd': 'pandas',
    'np': 'numpy',
    'sns': 'seaborn',
    'plt': 'matplotlib.pyplot'
}
_missing = []
for _alias, _pkg in _requirements.items():
    try:
        _module = importlib.import_module(_pkg)
        globals()[_alias] = _module
    except ModuleNotFoundError:
        _missing.append(_pkg)
if _missing:
    print(f"Error: required package(s) not installed: {', '.join(_missing)}")
    print("Install dependencies with:\n  python3 -m pip install " + " ".join(sorted(set(_missing))))
    print("Or create and use the project's virtual environment:\n  python3 -m venv .venv && .venv/bin/python -m pip install -r diamond/requirements.txt")
    raise ModuleNotFoundError(_missing[0])


# Paths
ROOT = Path(__file__).resolve().parent
IMG_DIR = ROOT / "images"
IMG_DIR.mkdir(exist_ok=True)
REPORT_PATH = ROOT / "analysis.md"

# Helper: safe markdown conversion for DataFrames
def df_to_markdown(df: pd.DataFrame) -> str:
    try:
        return df.to_markdown(index=True)
    except Exception:
        # Fallback: simple pipe-separated table
        cols = list(df.columns)
        header = "| Index | " + " | ".join(cols) + " |\n"
        sep = "|---" * (len(cols) + 1) + "|\n"
        rows = ""
        for idx, row in df.iterrows():
            rows += "| {} | {} |\n".format(idx, " | ".join(str(x) for x in row.values))
        return header + sep + rows

# Load dataset
df = sns.load_dataset('diamonds')

# Ensure we have consistent display settings
pd.set_option('display.max_columns', 50)

# Descriptive statistics (>=5 items)
desc = df.describe().T
skewness = df.skew(numeric_only=True)
kurtosis = df.kurtosis(numeric_only=True)
unique_counts = df.nunique()
value_counts_cut = df['cut'].value_counts()
value_counts_color = df['color'].value_counts()
value_counts_clarity = df['clarity'].value_counts()

# Additional derived stats
# Price per carat
df['price_per_carat'] = df['price'] / df['carat']
ppc_stats = df['price_per_carat'].describe()

# Correlation matrix
corr = df.select_dtypes(include=[np.number]).corr()

# Collect markdown lines
md_lines = []
md_lines.append('# Diamonds dataset EDA')
md_lines.append('\n')
md_lines.append('Dataset loaded from seaborn: `sns.load_dataset("diamonds")`')
md_lines.append('\n')
md_lines.append(f'**Shape:** {df.shape}')
md_lines.append('\n')
md_lines.append('## Columns')
md_lines.append('\n')
md_lines.append('`' + '`, `'.join(df.columns) + '`')
md_lines.append('\n')
md_lines.append('## Sample')
md_lines.append('\n')
md_lines.append(df.head().to_markdown())
md_lines.append('\n')

# Add descriptive stats
md_lines.append('## Descriptive Statistics (Summary) ✅')
md_lines.append('\n')
md_lines.append('### Numeric summary')
md_lines.append('\n')
md_lines.append(desc.to_markdown())
md_lines.append('\n')
md_lines.append('### Skewness and Kurtosis')
md_lines.append('\n')
skk = pd.DataFrame({'skewness': skewness, 'kurtosis': kurtosis})
md_lines.append(skk.to_markdown())
md_lines.append('\n')
md_lines.append('### Unique counts (per column)')
md_lines.append('\n')
md_lines.append(unique_counts.to_frame('unique_count').to_markdown())
md_lines.append('\n')
md_lines.append('### Value counts (categorical)')
md_lines.append('\n')
md_lines.append('**cut**')
md_lines.append('\n')
md_lines.append(value_counts_cut.to_frame('count').to_markdown())
md_lines.append('\n')
md_lines.append('**color**')
md_lines.append('\n')
md_lines.append(value_counts_color.to_frame('count').to_markdown())
md_lines.append('\n')
md_lines.append('**clarity**')
md_lines.append('\n')
md_lines.append(value_counts_clarity.to_frame('count').to_markdown())
md_lines.append('\n')
md_lines.append('### Price per Carat (derived)')
md_lines.append('\n')
md_lines.append(ppc_stats.to_frame().to_markdown())
md_lines.append('\n')
md_lines.append('### Correlation matrix (numeric)')
md_lines.append('\n')
md_lines.append(corr.to_markdown())
md_lines.append('\n')

# --- Visualizations (>=5) ---
visualizations = []

# 1) Histogram of price
plt.figure(figsize=(8,5))
sns.histplot(df['price'], bins=50, kde=True)
plt.title('Distribution of Price')
plt.xlabel('Price')
plt.tight_layout()
img1 = IMG_DIR / 'hist_price.png'
plt.savefig(img1)
plt.close()
# pivot: price bins
price_bins = pd.cut(df['price'], bins=10)
pivot1 = df.groupby(price_bins).size().to_frame('count')
visualizations.append(("Price Distribution", img1.name, pivot1))

# 2) Boxplot: price by cut
plt.figure(figsize=(8,5))
sns.boxplot(x='cut', y='price', data=df, order=['Fair','Good','Very Good','Premium','Ideal'])
plt.title('Price by Cut')
plt.tight_layout()
img2 = IMG_DIR / 'boxplot_price_cut.png'
plt.savefig(img2)
plt.close()
# pivot: median and IQR by cut
agg2 = df.groupby('cut')['price'].agg(['median', lambda x: x.quantile(0.25), lambda x: x.quantile(0.75)])
agg2.columns = ['median', 'q1', 'q3']
agg2['IQR'] = agg2['q3'] - agg2['q1']
visualizations.append(("Price by Cut (boxplot)", img2.name, agg2))

# 3) Scatter: price vs carat colored by color
plt.figure(figsize=(8,6))
sns.scatterplot(x='carat', y='price', hue='color', data=df, alpha=0.6)
plt.title('Price vs Carat (colored by Color)')
plt.tight_layout()
img3 = IMG_DIR / 'scatter_price_carat_color.png'
plt.savefig(img3)
plt.close()
# pivot: mean price by carat bins and color
df['carat_bin'] = pd.cut(df['carat'], bins=8)
pivot3 = df.groupby(['carat_bin','color'])['price'].mean().unstack().round(2)
visualizations.append(("Price vs Carat (mean price pivot)", img3.name, pivot3))

# 4) Violin: price by clarity
plt.figure(figsize=(8,5))
sns.violinplot(x='clarity', y='price', data=df, order=sorted(df['clarity'].unique()))
plt.title('Price by Clarity (Violin)')
plt.tight_layout()
img4 = IMG_DIR / 'violin_price_clarity.png'
plt.savefig(img4)
plt.close()
# pivot: median and mean by clarity
agg4 = df.groupby('clarity')['price'].agg(['median','mean']).round(2)
visualizations.append(("Price by Clarity (violin)", img4.name, agg4))

# 5) Heatmap: correlation
plt.figure(figsize=(8,6))
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm')
plt.title('Correlation matrix (numeric)')
plt.tight_layout()
img5 = IMG_DIR / 'heatmap_correlation.png'
plt.savefig(img5)
plt.close()
visualizations.append(("Correlation Matrix", img5.name, corr.round(3)))

# 6) Barplot: average price by cut
plt.figure(figsize=(7,5))
order = ['Fair','Good','Very Good','Premium','Ideal']
avg_price_cut = df.groupby('cut')['price'].mean().reindex(order)
sns.barplot(x=avg_price_cut.index, y=avg_price_cut.values)
plt.ylabel('Average Price')
plt.title('Average Price by Cut')
plt.tight_layout()
img6 = IMG_DIR / 'bar_avg_price_cut.png'
plt.savefig(img6)
plt.close()
visualizations.append(("Average Price by Cut", img6.name, avg_price_cut.to_frame('avg_price')))

# Append visualizations and their pivot tables to markdown
md_lines.append('## Visualizations & Cross-tables ✅')
md_lines.append('\n')
for title, img_name, pivot_df in visualizations:
    md_lines.append(f'### {title} 🔧')
    md_lines.append('\n')
    md_lines.append(f'![{title}]({{}}/{img_name})'.format('images'))
    md_lines.append('\n')
    md_lines.append('**Associated pivot / summary:**')
    md_lines.append('\n')
    md_lines.append(df_to_markdown(pivot_df))
    md_lines.append('\n')

# Save markdown
with open(REPORT_PATH, 'w', encoding='utf-8') as f:
    f.write('\n'.join(md_lines))

print('EDA complete — images saved to:', IMG_DIR)
print('Report written to:', REPORT_PATH)
