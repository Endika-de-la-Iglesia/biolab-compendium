export const unitConversionFactors = {
  concentration: {
    molarity: {
      M: 1,
      mM: 10 ** 3,
      µM: 10 ** 6,
      nM: 10 ** 9,
    },

    "g/mL": {
      "g/mL": 1,
      "mg/mL": 10 ** 3,
      "µg/mL": 10 ** 6,
      "ng/mL": 10 ** 9,
    },

    "mg/uL": {
      "mg/µL": 1,
      "µg/µL": 10 ** 3,
      "ng/µL": 10 ** 6,
    },

    "%": {
      "%v/v": 1,
      "%m/v (g/ml)": 1,
    },

    x: {
      x: 1,
    },

    U: { "U/µL": 1 },
  },
  volume: {
    L: 1,
    mL: 10 ** 3,
    µL: 10 ** 6,
    nL: 10 ** 9,
  },
};

export const getUnitType = (initialUnit) => {
  const { concentration, volume } = unitConversionFactors;

  for (const unitType in concentration) {
    if (concentration[unitType].hasOwnProperty(initialUnit)) {
      return unitType;
    }
  }

  for (const unitType in volume) {
    if (volume.hasOwnProperty(initialUnit)) {
      return unitType;
    }
  }

  return null;
};

export const concentrationUnitsMatching = (initialUnit, finalUnit) => {
  const { concentration } = unitConversionFactors;

  for (const unitType in concentration) {
    if (
      concentration[unitType].hasOwnProperty(initialUnit) &&
      concentration[unitType].hasOwnProperty(finalUnit)
    ) {
      return true;
    }
  }

  return false;
};

export const correctConcentrationLogic = (
  initialValue,
  initialUnit,
  finalValue,
  finalUnit
) => {
  const { concentration } = unitConversionFactors;

  let initialFactor, finalFactor;
  let foundInitial = false;
  let foundFinal = false;

  for (const unitType in concentration) {
    if (concentration[unitType].hasOwnProperty(initialUnit)) {
      initialFactor = concentration[unitType][initialUnit];
      foundInitial = true;
    }
    if (concentration[unitType].hasOwnProperty(finalUnit)) {
      finalFactor = concentration[unitType][finalUnit];
      foundFinal = true;
    }
    if (initialFactor !== undefined && finalFactor !== undefined) {
      break;
    }
  }

  if (
    !foundInitial ||
    !foundFinal ||
    initialFactor === undefined ||
    finalFactor === undefined
  ) {
    return false;
  }

  if (initialFactor < finalFactor) {
    return true;
  } else if (initialFactor > finalFactor) {
    return false;
  } else if (initialFactor === finalFactor) {
    if (initialValue <= finalValue) {
      return false;
    } else {
      return true;
    }
  } else {
    return initialValue > finalValue;
  }
};

export const calculateReactiveVolume = (
  finalVolumeValue,
  finalVolumeUnits,
  initialConcentrationValue,
  initialConcentrationUnits,
  finalConcentrationValue,
  finalConcentrationUnits
) => {
  if (
    correctConcentrationLogic(
      initialConcentrationValue,
      initialConcentrationUnits,
      finalConcentrationValue,
      finalConcentrationUnits
    )
  ) {
    const { concentration } = unitConversionFactors;

    let initialFactor;
    let finalFactor;

    for (const unitType in concentration) {
      if (concentration[unitType].hasOwnProperty(initialConcentrationUnits)) {
        initialFactor = concentration[unitType][initialConcentrationUnits];
      }
      if (concentration[unitType].hasOwnProperty(finalConcentrationUnits)) {
        finalFactor = concentration[unitType][finalConcentrationUnits];
      }
    }

    const dilutionFactor = initialFactor / finalFactor;
    const reactiveVolumeUnits = finalVolumeUnits;
    const reactiveVolumeValue =
      (finalConcentrationValue * finalVolumeValue * dilutionFactor) /
      initialConcentrationValue;

    const result = { reactiveVolumeValue, reactiveVolumeUnits };
    return result;
  } else {
    return new Error(
      "El cálculo no se puede realizar, comprueba las unidades y los valores. Una concentración final no puede estar más concentrada que una inicial."
    );
  }
};

export const decimalCommaToDot = (num) => {
  if (typeof num !== "string") {
    num = num.toString();
  }

  let normalizedNum;
  const lastCommaIndex = num.lastIndexOf(",");
  const lastDotIndex = num.lastIndexOf(".");

  const countOccurrences = (str, char) => {
    return str.split(char).length - 1;
  };

  const numCommas = countOccurrences(num, ",");
  const numDots = countOccurrences(num, ".");

  if (numCommas > 1 && numDots === 0) {
    normalizedNum = num.replace(/,/g, "");
  } else if (numCommas === 0 && numDots > 1) {
    normalizedNum = num.replace(/\./g, "");
  } else if (lastCommaIndex > lastDotIndex) {
    normalizedNum = num.replace(/\./g, "").replace(",", ".");
  } else if (lastDotIndex > lastCommaIndex) {
    normalizedNum = num.replace(/,/g, "");
  } else if (lastCommaIndex === -1 && lastDotIndex === -1) {
    normalizedNum = num;
  } else if (lastCommaIndex === -1) {
    normalizedNum = num.replace(/,/g, "");
  } else if (lastDotIndex === -1) {
    normalizedNum = num.replace(/\./g, "").replace(",", ".");
  }

  const parsedNum = parseFloat(normalizedNum); 
  return isNaN(parsedNum) ? "" : parsedNum;
};

export const convertVolumeUnits = (value, fromUnit, toUnit) => {
  const conversionFactor =
    unitConversionFactors.volume[toUnit] /
    unitConversionFactors.volume[fromUnit];
  return value * conversionFactor;
};