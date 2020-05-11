// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, desc, val) {
            var newItem, id;

            // Create new ID
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }


            // Create new item based on 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(id, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(id, desc, val);
            }

            // Push new item into array based on 'inc' or 'exp'
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            // Find index of element in array through id 

            // 1. Loop array to get all id

            ids = data.allItems[type].map(function (current) {
                // return an array contain all id
                return current.id;
            });

            // 2. Get index of element 
            index = ids.indexOf(id);

            if (index !== -1) {
                // Delete element use index position
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {
            // Calculate total inc and epx
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of inc that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }


        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
    };

})();

// UI CONTROLLER
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        btnInput: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,

                desc: document.querySelector(DOMStrings.inputDesc).value,

                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = `<div class="item clearfix" id="inc-${obj.id}"> <div class="item__description">${obj.desc}</div>
                <div class="right clearfix"> <div class="item__value">${formatNumber(obj.value, type)}</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>`;
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = `<div class="item clearfix" id="exp-${obj.id}"> <div class="item__description">${obj.desc}</div> <div class="right clearfix">
                <div class="item__value">${formatNumber(obj.value, type)}</div> <div class="item__percentage">21%</div>
                <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>`;
            }

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);

        },

        deleteListItem: function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var descInput, valueInput

            descInput = document.querySelector(DOMStrings.inputDesc);
            descInput.value = '';
            descInput.focus();

            valueInput = document.querySelector(DOMStrings.inputValue);
            valueInput.value = '';
        },

        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.itemPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            })

        },

        displayMonth: function () {
            var now, months, month, year;
 
            now = new Date(); 
            months = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        }, 

        changedType: function () {  
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
            DOMStrings.inputDesc + ',' +
            DOMStrings.inputValue
            );

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.btnInput).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    };

})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    // Setup event listener
    var eventListener = function () {

        // Get DOM Strings 
        var DOM = UICtrl.getDOMStrings();

        // Setup for btn click
        document.querySelector(DOM.btnInput).addEventListener('click', ctrlAddItem);

        // Setup when press enter (return) key
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    };

    var updateBudget = function () {
        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentage();

        // 3. Update UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get the filed input data
        input = UICtrl.getInput();

        // 2. Add the item to the budget controller
        if (input.desc !== '' && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.desc, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields input 
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, Id;

        // Access to parent element of itself (parent of i element when we click button delete)
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitId = itemId.split('-'); // This is an array
            type = splitId[0]; // Get type
            Id = parseInt(splitId[1]); // Get Id

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, Id);

            // 2. Delete the item from UI
            UICtrl.deleteListItem(itemId);

            // 3. Update and show the new budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('Application has started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            eventListener();
        }
    };

})(budgetController, UIController);

controller.init();