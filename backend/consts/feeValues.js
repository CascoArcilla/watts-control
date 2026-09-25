const FEE_DEFAULT_VALUES = {
    bs_price: 1.125,
    md_price: 1.369,
    sp_price: 4.004,
    dca_price: 6.80,
}

const FEE_LIMITS = {
    "1": {
        basic: 75,
        intermediate: 250,
        exceeding: 500,
    },
    "1A": {
        basic: 75,
        intermediate: 125,
        exceeding: 500,
    },
    "1B": {
        basic: 75,
        intermediate: 125,
        exceeding: 500,
    },
    "1C": {
        basic: 75,
        intermediate: 125,
        exceeding: 500,
    },
    "1D": {
        basic: 75,
        intermediate: 125,
        exceeding: 500,
    }
}

module.exports = { FEE_DEFAULT_VALUES }