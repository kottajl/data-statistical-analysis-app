from scipy.stats import normaltest, ttest_ind


def normal_test(data):
    stat, p = normaltest(data)
    return p >= 0.05


def statistical_significance_test(data1,data2):
    stat, p = ttest_ind(data1,data2)
    return p >= 0.05
