// BUDGET CONTROLLER
var budgetController = (function () {

    // Create objects for expense and income
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
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

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
      var sum = 0;
      data.allItems[type].forEach(function (cur) {
          sum += cur.value;
      });
      data.totals[type] = sum;
    };

    // Put all the objects into the 'data'
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
        percentage: -1 // because there can't be any percentage value if there's no budget
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID; ID;

            // ID for the new item will be lastID of the element in array + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1] + 1;
            }else {
                ID = 0;
            }

            // Create a new item based on 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Put it to the data -> allItems
            data.allItems[type].push(newItem);
            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id); // If ids = [1, 2, 4, 6, 8] then indexOf 6 will be 3

            if (index !== -1) {
                // Now delete elements from the current index and delete 1 item
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
          // 1. Calculate total income and budget
            calculateTotal('exp');
            calculateTotal('inc');

          // 2. Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

          // 3. Calculate the percentage of income we spent
            if (data.totals.inc > 0) {
             data.percentage = Math.round ((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
          var allPerc = data.allItems.exp.map(function (cur) {
             return cur.getPercentage();
          });
          return allPerc;
        },

        getBudget: function () {
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          }
        },

        testing: function () {
            console.log(data);
        }
    }
})();

// UI CONTROLLER
var UIController = (function () {

    var DOMStrings = {
      inputType: '.add__type',
      inputDescription: '.add__description',
      inputValue: '.add__value',
      inputBtn: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      container: '.container',
      expensesPercLabel: '.item__percentage',
      dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, tyoe) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int +  '.' + dec;
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                // Convert string "value" into floating number
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
          // 1. Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html =
                    '<div class="item clearfix" id="inc-%id%">' +
                    '<div class="item__description">%description%</div> ' +
                    '<div class="right clearfix">' +
                    '<div class="item__value">%value%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value">%value%</div>' +
                    '<div class="item__percentage">21%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div> </div> </div>'
            }
          // 2. Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

          // 3. Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        // Clear input fields after submission of values
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            // Return the fields into an array using slice and the global Array constructor
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
               // Empty the fields
                current.value = '';
            });

            // Set the focus back to description field
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc') ;
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            var nodeListForEach = function (list, callback) {
              for (var i = 0; i < list.length; i++) {
                  callback(list[i], i);
              }
            };

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0)  {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            var now, year, month, months;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        // Expose DOMStrings as public
        getDOMStrings: function () {
            return DOMStrings;
        }
    };
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UIController.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Global event listener
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
      // 1. Calculate percentages
       budgetCtrl.calculatePercentages();
      // 2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
      // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add the item to UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear the fields
            UICtrl.clearFields();
            // 5. Calculate and update budget
            updateBudget();
            // 7. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
       var itemID, splitID, type, ID;

       itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

       if (itemID) {
            // Split the id format
           splitID = itemID.split('-');
           // Get the first element of the split
           type = splitID[0];
           // Now the second ID
           ID = parseInt(splitID[1]);

           // 1. Delete the item from data structure
           budgetCtrl.deleteItem(type, ID);
           // 2. Delete the item from UI
           UICtrl.deleteListItem(itemID);
           // 3. Update and show the budget
           updateBudget();
           // 4. Calculate and update percentages
           updatePercentages();
       }
    };
    
    return {
        init: function () {
            console.log('App started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }


})(budgetController, UIController);

controller.init();