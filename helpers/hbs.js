module.exports = {
    checkEqual: function (value1, value2) {
        if (value1 === value2) {
            return true;
        } else {
            return false;
        }
    },
    randomNumber: function () {
        return Math.floor(Math.random() * 999);
    },
    setVar: function (varName, varIndex, varValue, options) {
        const newVarName = varName + varIndex;
        options.data.root[newVarName] = varValue;
    },
    getVar: function (varName, varIndex, options) {
        const newVarName = varName + varIndex;
        return options.data.root[newVarName];
    },
    isTen: function (value) {
        return !(value >= 10);
    },
};
