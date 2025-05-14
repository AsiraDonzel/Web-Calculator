document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const display = document.getElementById("calc-display");
    const buttons = document.querySelectorAll(".btn");
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    const currencyAmount = document.getElementById("currency-amount");
    const fromCurrency = document.getElementById("from-currency");
    const toCurrency = document.getElementById("to-currency");
    const convertCurrencyBtn = document.getElementById("convert-currency");
    const currencyResult = document.getElementById("currency-result");

    const unitInput = document.getElementById("unit-input");
    const unitType = document.getElementById("unit-type");
    const fromUnit = document.getElementById("from-unit");
    const toUnit = document.getElementById("to-unit");
    const convertUnitBtn = document.getElementById("convert-unit");
    const unitResult = document.getElementById("unit-result");

    const historyList = document.getElementById("history-list");
    const clearHistoryBtn = document.getElementById("clear-history");

    const weightInput = document.getElementById("weight");
    const heightInput = document.getElementById("height");
    const calculateBmiBtn = document.getElementById("calculate-bmi");
    const bmiResult = document.getElementById("bmi-result");
    const bmiCategory = document.getElementById("bmi-category");

    // Variables
    let currentInput = "";
    let memory = 0;
    let calculationHistory = [];
    let exchangeRates = {};

    // Constants
    const API_KEY = "YOUR_REAL_KEY";
    const API_URL = localStorage.getItem("currencyKey");

    // Unit Conversion Data
    const unitConversions = {
        length: {
            m: 1,
            cm: 100,
            in: 39.3701,
            ft: 3.28084,
        },
        weight: {
            kg: 1,
            lbs: 2.20462,
        },
        temperature: {
            celsius: {
                toFahrenheit: (c) => (c * 9 / 5) + 32,
                toKelvin: (c) => c + 273.15,
            },
            fahrenheit: {
                toCelsius: (f) => (f - 32) * 5 / 9,
                toKelvin: (f) => (f - 32) * 5 / 9 + 273.15,
            },
            kelvin: {
                toCelsius: (k) => k - 273.15,
                toFahrenheit: (k) => (k - 273.15) * 9 / 5 + 32,
            },
        },
    };

    // Fetch Exchange Rates
    async function fetchExchangeRates() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            exchangeRates = data.conversion_rates;
        } catch (error) {
            console.error("Error fetching exchange rates:", error);
            alert("Failed to fetch exchange rates. Please try again later.");
        }
    }

    // Currency Conversion
    convertCurrencyBtn.addEventListener("click", () => {
        const amount = parseFloat(currencyAmount.value);
        const from = fromCurrency.value;
        const to = toCurrency.value;

        if (isNaN(amount)) {
            alert("Please enter a valid amount.");
            return;
        }

        if (!exchangeRates[from] || !exchangeRates[to]) {
            alert("Invalid currency selection.");
            return;
        }

        const convertedAmount = (amount / exchangeRates[from]) * exchangeRates[to];
        currencyResult.querySelector("span").textContent = convertedAmount.toFixed(2);
    });

    // Unit Conversion
    unitType.addEventListener("change", () => {
        const type = unitType.value;
        const units = Object.keys(unitConversions[type]);

        fromUnit.innerHTML = units.map(unit => `<option value="${unit}">${unit}</option>`).join("");
        toUnit.innerHTML = units.map(unit => `<option value="${unit}">${unit}</option>`).join("");
    });

    convertUnitBtn.addEventListener("click", () => {
        const value = parseFloat(unitInput.value);
        const type = unitType.value;
        const from = fromUnit.value;
        const to = toUnit.value;

        if (isNaN(value)) {
            alert("Please enter a valid value.");
            return;
        }

        let convertedValue;

        if (type === "temperature") {
            if (from === "celsius") {
                convertedValue = to === "fahrenheit" ? unitConversions.temperature.celsius.toFahrenheit(value) : unitConversions.temperature.celsius.toKelvin(value);
            } else if (from === "fahrenheit") {
                convertedValue = to === "celsius" ? unitConversions.temperature.fahrenheit.toCelsius(value) : unitConversions.temperature.fahrenheit.toKelvin(value);
            } else if (from === "kelvin") {
                convertedValue = to === "celsius" ? unitConversions.temperature.kelvin.toCelsius(value) : unitConversions.temperature.kelvin.toFahrenheit(value);
            }
        } else {
            convertedValue = value * (unitConversions[type][to] / unitConversions[type][from]);
        }

        unitResult.querySelector("span").textContent = convertedValue.toFixed(2);
    });

    // History Log
    function addToHistory(calculation) {
        calculationHistory.push(calculation);
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        historyList.innerHTML = calculationHistory
            .map((calc, index) => `<li>${index + 1}. ${calc}</li>`)
            .join("");
    }

    clearHistoryBtn.addEventListener("click", () => {
        calculationHistory = [];
        updateHistoryDisplay();
    });

    // Calculator Logic
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            let value = button.innerText.trim();

            // Memory Functions
            if (button.id === "memory-clear") {
                memory = 0;
                alert("Memory Cleared!");
                return;
            }
            if (button.id === "memory-recall") {
                currentInput = memory.toString();
                display.value = currentInput;
                return;
            }
            if (button.id === "memory-add") {
                memory += parseFloat(currentInput) || 0;
                alert(`Memory Updated: ${memory}`);
                return;
            }
            if (button.id === "memory-subtract") {
                memory -= parseFloat(currentInput) || 0;
                alert(`Memory Updated: ${memory}`);
                return;
            }

            // Clear and Backspace
            if (button.id === "clear") {
                currentInput = "";
                display.value = "0";
                return;
            }
            if (button.id === "backspace") {
                currentInput = currentInput.slice(0, -1);
                display.value = currentInput || "0";
                return;
            }

            // Equals (Safe Evaluation)
            if (button.id === "equals") {
                try {
                    const result = Function(`'use strict'; return (${currentInput})`)();
                    const calculation = `${currentInput} = ${result}`;
                    addToHistory(calculation); // Add to history
                    currentInput = result.toString();
                    display.value = currentInput;
                } catch {
                    display.value = "Error";
                    currentInput = "";
                }
                return;
            }

            // Percentage
            if (button.id === "percent") {
                currentInput = (parseFloat(currentInput) / 100).toString();
                display.value = currentInput;
                return;
            }

            // Square root
            if (button.id === "sqrt") {
                currentInput = Math.sqrt(parseFloat(currentInput)).toFixed(6).toString();
                display.value = currentInput;
                return;
            }

            // Power function (xʸ)
            if (button.id === "power") {
                currentInput += "**";
                display.value = currentInput;
                return;
            }

            // Pi
            if (button.id === "pi") {
                currentInput += Math.PI.toFixed(6).toString();
                display.value = currentInput;
                return;
            }

            // Trigonometry (Radians)
            if (button.id === "sin") {
                currentInput = Math.sin(parseFloat(currentInput) * Math.PI / 180).toFixed(6).toString();
                display.value = currentInput;
                return;
            }
            if (button.id === "cos") {
                currentInput = Math.cos(parseFloat(currentInput) * Math.PI / 180).toFixed(6).toString();
                display.value = currentInput;
                return;
            }
            if (button.id === "tan") {
                currentInput = Math.tan(parseFloat(currentInput) * Math.PI / 180).toFixed(6).toString();
                display.value = currentInput;
                return;
            }

            // Logarithms
            if (button.id === "log") {
                currentInput = Math.log10(parseFloat(currentInput)).toFixed(6).toString();
                display.value = currentInput;
                return;
            }
            if (button.id === "ln") {
                currentInput = Math.log(parseFloat(currentInput)).toFixed(6).toString();
                display.value = currentInput;
                return;
            }

            // Prevent multiple operators
            if ("+-*/.".includes(value) && "+-*/.".includes(currentInput.slice(-1))) return;

            // Append input
            currentInput += value;
            display.value = currentInput;
        });
    });

    // BMI Calculation
    calculateBmiBtn.addEventListener("click", () => {
        console.log("Calculate BMI button clicked"); // Debugging

        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value) / 100; // Convert cm to meters

        console.log("Weight:", weight, "Height:", height); // Debugging

        if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
            alert("Please enter valid weight and height.");
            return;
        }

        const bmi = (weight / (height * height)).toFixed(2);
        console.log("BMI Calculated:", bmi); // Debugging

        bmiResult.querySelector("span").textContent = bmi;

        // Determine BMI category
        let category;
        if (bmi < 18.5) {
            category = "Underweight";
        } else if (bmi >= 18.5 && bmi < 24.9) {
            category = "Normal weight";
        } else if (bmi >= 25 && bmi < 29.9) {
            category = "Overweight";
        } else {
            category = "Obesity";
        }

        bmiCategory.querySelector("span").textContent = category;
    });

    // Dark and Light Mode Toggle
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        themeToggle.innerText = body.classList.contains("dark-mode") ? "Light Mode" : "Dark Mode";
    });

    // Fetch exchange rates on page load
    fetchExchangeRates();
});