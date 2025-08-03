/**
 * Unit Converter Application
 * A responsive web application for converting between different units
 * with localStorage persistence and smooth animations
 */

class UnitConverter {
    constructor() {
        // Unit definitions with conversion factors to base units
        this.units = {
            length: {
                name: 'Length',
                baseUnit: 'meter',
                units: {
                    millimeter: { name: 'Millimeter (mm)', factor: 0.001 },
                    centimeter: { name: 'Centimeter (cm)', factor: 0.01 },
                    meter: { name: 'Meter (m)', factor: 1 },
                    kilometer: { name: 'Kilometer (km)', factor: 1000 },
                    inch: { name: 'Inch (in)', factor: 0.0254 },
                    foot: { name: 'Foot (ft)', factor: 0.3048 },
                    yard: { name: 'Yard (yd)', factor: 0.9144 },
                    mile: { name: 'Mile (mi)', factor: 1609.344 }
                }
            },
            weight: {
                name: 'Weight',
                baseUnit: 'kilogram',
                units: {
                    gram: { name: 'Gram (g)', factor: 0.001 },
                    kilogram: { name: 'Kilogram (kg)', factor: 1 },
                    pound: { name: 'Pound (lb)', factor: 0.453592 },
                    ounce: { name: 'Ounce (oz)', factor: 0.0283495 },
                    ton: { name: 'Metric Ton (t)', factor: 1000 },
                    stone: { name: 'Stone (st)', factor: 6.35029 }
                }
            },
            temperature: {
                name: 'Temperature',
                baseUnit: 'celsius',
                units: {
                    celsius: { name: 'Celsius (°C)' },
                    fahrenheit: { name: 'Fahrenheit (°F)' },
                    kelvin: { name: 'Kelvin (K)' }
                }
            },
            volume: {
                name: 'Volume',
                baseUnit: 'liter',
                units: {
                    milliliter: { name: 'Milliliter (ml)', factor: 0.001 },
                    liter: { name: 'Liter (l)', factor: 1 },
                    gallon_us: { name: 'US Gallon (gal)', factor: 3.78541 },
                    gallon_uk: { name: 'UK Gallon (gal)', factor: 4.54609 },
                    quart: { name: 'Quart (qt)', factor: 0.946353 },
                    pint: { name: 'Pint (pt)', factor: 0.473176 },
                    cup: { name: 'Cup', factor: 0.236588 },
                    fluid_ounce: { name: 'Fluid Ounce (fl oz)', factor: 0.0295735 }
                }
            }
        };

        // Current state
        this.currentCategory = 'length';
        this.conversionHistory = this.loadHistory();

        // DOM elements
        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.categoryButtons = document.querySelectorAll('.category-btn');
        this.fromValueInput = document.getElementById('from-value');
        this.toValueInput = document.getElementById('to-value');
        this.fromUnitSelect = document.getElementById('from-unit');
        this.toUnitSelect = document.getElementById('to-unit');
        this.swapButton = document.getElementById('swap-units');
        this.resultDisplay = document.getElementById('result-display');
        this.historyContainer = document.getElementById('history-container');
        this.clearHistoryButton = document.getElementById('clear-history');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Category selection
        this.categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Input value changes
        this.fromValueInput.addEventListener('input', () => {
            this.performConversion();
        });

        // Unit selection changes
        this.fromUnitSelect.addEventListener('change', () => {
            this.performConversion();
        });

        this.toUnitSelect.addEventListener('change', () => {
            this.performConversion();
        });

        // Swap units
        this.swapButton.addEventListener('click', () => {
            this.swapUnits();
        });

        // Clear history
        this.clearHistoryButton.addEventListener('click', () => {
            this.clearHistory();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                // Enhanced keyboard navigation can be added here
            }
        });
    }

    /**
     * Initialize the application
     */
    initializeApp() {
        this.populateUnitSelectors();
        this.renderHistory();
        this.updateClearHistoryButton();
        
        // Set default units
        this.fromUnitSelect.value = Object.keys(this.units[this.currentCategory].units)[0];
        this.toUnitSelect.value = Object.keys(this.units[this.currentCategory].units)[1] || 
                                Object.keys(this.units[this.currentCategory].units)[0];
    }

    /**
     * Switch between conversion categories
     * @param {string} category - The category to switch to
     */
    switchCategory(category) {
        if (category === this.currentCategory) return;

        // Update active button
        this.categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        this.currentCategory = category;
        this.populateUnitSelectors();
        this.clearInputs();
        this.updateResultDisplay('Enter a value to see the conversion');
    }

    /**
     * Populate unit selector dropdowns
     */
    populateUnitSelectors() {
        const units = this.units[this.currentCategory].units;
        const unitKeys = Object.keys(units);

        // Clear existing options
        this.fromUnitSelect.innerHTML = '';
        this.toUnitSelect.innerHTML = '';

        // Populate both selectors
        unitKeys.forEach(unitKey => {
            const option1 = document.createElement('option');
            option1.value = unitKey;
            option1.textContent = units[unitKey].name;
            this.fromUnitSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = unitKey;
            option2.textContent = units[unitKey].name;
            this.toUnitSelect.appendChild(option2);
        });

        // Set default selections
        if (unitKeys.length > 0) {
            this.fromUnitSelect.value = unitKeys[0];
            this.toUnitSelect.value = unitKeys[1] || unitKeys[0];
        }
    }

    /**
     * Perform unit conversion
     */
    performConversion() {
        const fromValue = parseFloat(this.fromValueInput.value);
        const fromUnit = this.fromUnitSelect.value;
        const toUnit = this.toUnitSelect.value;

        // Validate input
        if (isNaN(fromValue) || fromValue === '') {
            this.toValueInput.value = '';
            this.updateResultDisplay('Enter a value to see the conversion');
            return;
        }

        let convertedValue;

        try {
            if (this.currentCategory === 'temperature') {
                convertedValue = this.convertTemperature(fromValue, fromUnit, toUnit);
            } else {
                convertedValue = this.convertStandardUnits(fromValue, fromUnit, toUnit);
            }

            // Update UI
            this.toValueInput.value = this.formatNumber(convertedValue);
            this.updateResultDisplay(
                `${this.formatNumber(fromValue)} ${this.units[this.currentCategory].units[fromUnit].name} = 
                ${this.formatNumber(convertedValue)} ${this.units[this.currentCategory].units[toUnit].name}`
            );

            // Add to history
            this.addToHistory(fromValue, fromUnit, convertedValue, toUnit);

        } catch (error) {
            console.error('Conversion error:', error);
            this.updateResultDisplay('Error: Invalid conversion');
        }
    }

    /**
     * Convert standard units (length, weight, volume)
     * @param {number} value - Value to convert
     * @param {string} fromUnit - Source unit
     * @param {string} toUnit - Target unit
     * @returns {number} Converted value
     */
    convertStandardUnits(value, fromUnit, toUnit) {
        const units = this.units[this.currentCategory].units;
        const fromFactor = units[fromUnit].factor;
        const toFactor = units[toUnit].factor;

        // Convert to base unit, then to target unit
        const baseValue = value * fromFactor;
        return baseValue / toFactor;
    }

    /**
     * Convert temperature units
     * @param {number} value - Temperature value
     * @param {string} fromUnit - Source temperature unit
     * @param {string} toUnit - Target temperature unit
     * @returns {number} Converted temperature
     */
    convertTemperature(value, fromUnit, toUnit) {
        if (fromUnit === toUnit) return value;

        let celsius;

        // Convert to Celsius first
        switch (fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
            default:
                throw new Error('Invalid from unit');
        }

        // Convert from Celsius to target unit
        switch (toUnit) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return (celsius * 9/5) + 32;
            case 'kelvin':
                return celsius + 273.15;
            default:
                throw new Error('Invalid to unit');
        }
    }

    /**
     * Swap the from and to units
     */
    swapUnits() {
        const fromUnit = this.fromUnitSelect.value;
        const toUnit = this.toUnitSelect.value;
        const fromValue = this.fromValueInput.value;
        const toValue = this.toValueInput.value;

        // Swap units
        this.fromUnitSelect.value = toUnit;
        this.toUnitSelect.value = fromUnit;

        // Swap values if both exist
        if (fromValue && toValue) {
            this.fromValueInput.value = toValue;
            this.performConversion();
        }
    }

    /**
     * Add conversion to history
     * @param {number} fromValue - Original value
     * @param {string} fromUnit - Original unit
     * @param {number} toValue - Converted value
     * @param {string} toUnit - Target unit
     */
    addToHistory(fromValue, fromUnit, toValue, toUnit) {
        const conversion = {
            id: Date.now(),
            category: this.currentCategory,
            fromValue,
            fromUnit,
            toValue,
            toUnit,
            fromUnitName: this.units[this.currentCategory].units[fromUnit].name,
            toUnitName: this.units[this.currentCategory].units[toUnit].name,
            timestamp: new Date().toLocaleString()
        };

        // Add to beginning of history
        this.conversionHistory.unshift(conversion);

        // Limit history to 50 items
        if (this.conversionHistory.length > 50) {
            this.conversionHistory = this.conversionHistory.slice(0, 50);
        }

        this.saveHistory();
        this.renderHistory();
        this.updateClearHistoryButton();
    }

    /**
     * Render conversion history
     */
    renderHistory() {
        if (this.conversionHistory.length === 0) {
            this.historyContainer.innerHTML = `
                <div class="empty-history">
                    <span class="empty-icon">📋</span>
                    <p>No conversions yet. Start converting to see your history!</p>
                </div>
            `;
            return;
        }

        const historyHTML = this.conversionHistory.map(item => `
            <div class="history-item">
                <div class="history-conversion">
                    <div class="history-values">
                        ${this.formatNumber(item.fromValue)} ${item.fromUnitName} = 
                        ${this.formatNumber(item.toValue)} ${item.toUnitName}
                    </div>
                    <div class="history-timestamp">${item.timestamp}</div>
                </div>
            </div>
        `).join('');

        this.historyContainer.innerHTML = historyHTML;
    }

    /**
     * Clear conversion history
     */
    clearHistory() {
        if (this.conversionHistory.length === 0) return;

        if (confirm('Are you sure you want to clear all conversion history?')) {
            this.conversionHistory = [];
            this.saveHistory();
            this.renderHistory();
            this.updateClearHistoryButton();
        }
    }

    /**
     * Update clear history button state
     */
    updateClearHistoryButton() {
        this.clearHistoryButton.disabled = this.conversionHistory.length === 0;
    }

    /**
     * Update result display
     * @param {string} text - Text to display
     */
    updateResultDisplay(text) {
        this.resultDisplay.innerHTML = `<span class="result-text">${text}</span>`;
        this.resultDisplay.classList.toggle('has-result', text !== 'Enter a value to see the conversion');
    }

    /**
     * Clear input fields
     */
    clearInputs() {
        this.fromValueInput.value = '';
        this.toValueInput.value = '';
    }

    /**
     * Format number for display
     * @param {number} number - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(number) {
        if (Math.abs(number) >= 1000000) {
            return number.toExponential(6);
        } else if (Math.abs(number) < 0.001 && number !== 0) {
            return number.toExponential(6);
        } else {
            return parseFloat(number.toFixed(8)).toString();
        }
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('unitConverterHistory', JSON.stringify(this.conversionHistory));
        } catch (error) {
            console.error('Failed to save history to localStorage:', error);
        }
    }

    /**
     * Load history from localStorage
     * @returns {Array} Conversion history
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('unitConverterHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load history from localStorage:', error);
            return [];
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const converter = new UnitConverter();
    
    // Make converter available globally for debugging
    window.unitConverter = converter;
    
    console.log('Unit Converter initialized successfully');
});

// Service Worker registration for potential PWA features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker can be added later for offline functionality
        console.log('Service Worker support detected');
    });
}