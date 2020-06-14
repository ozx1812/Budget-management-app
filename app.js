var budgetController = (function() {
    
    // Expense function constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentages = function(totalInclome) {
        
        if(totalInclome > 0) {
            this.percentage = Math.round(((this.value/totalInclome)* 100));    
        } else {
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;        
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(current, index, array) {
            sum += current.value;     
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
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // [1,2,3,4,5], nextID = 6
            // [1,2,4,6,8], nextID = 9
            // ID = last ID + 1 
            
            // create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;    
            } else {                
                ID = 0;
            }
            
            
            // create new Item based on 'inc' or 'exp' type
            if(type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            
            // push it into our data structure
            data.allItems[type].push(newItem);
            
            // return the new item
            return newItem;
        },
        
        deleteItem: function(type, id) {
            // id = 6
            // data.allItems[type][id];
            // ids = [1 2 4 6 8]
            // index = 3
            
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current, index, array) {
                current.calcPercentages(data.totals.inc);
                            
            });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
                
            });
            
            return allPerc;
            
        },
        
        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calcualte the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;    
            } else {
                data.percentage = -1;
            }
            
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };    
        },
        
        testing: function() {
            console.log(data);
        }
    }
    
})();

var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
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
        
    var formatNumber= function(num, type) {
        /*
            + or - before the number,
            exactly 2 decimal points,
            comma separating the thousands,
            2310.4567 -> + 2320.46,
            2000 -> +2000.00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        dec = numSplit[0];

        if(dec.length > 3) {
            dec = dec.substr(0, dec.length - 3) + ',' + dec.substr(dec.length - 3, dec.length);
        }
        fp = numSplit[1];

        ;

        return (type === 'exp' ? '-' : '+') + ' ' + dec + '.' + fp;

    };

    var nodeListForEach = function(list, callback) {
        for(var i =0; i < list.length ; i++) {
            callback(list[i] , i);
        }                
    };
    
    
    
    return {
        getInput: function() {
        //  var type = document.querySelector('.add__type').value; // will be wither inc or exp
        //  var description = document.querySelector('.add__description').value;
        //  var value = document.querySelector('.add__value').value;
          
          return {
            type: document.querySelector(DOMstrings.inputType).value, // will be wither inc or exp
            description:  document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
          };
        },
        
        addListItem: function(obj, type) {
            var html, newHTML, element;
            
            // create HTML string with placeholder text
            
            if(type === 'inc') {
                
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder with some sctual data
            
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            newHTML = newHTML.replace('%description%', obj.description);
            
            
            // Insert the HTML into DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            // return list -> convert into array
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); 
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            
            /*
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            */
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
                        
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';    
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }
                        
        },
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); // return a nodelist
            // to convert this nodelist into an array we can use slice method of array prototype
            // create our own forEach method for node list
            
//            var nodeListForEach = function(list, callback) {
//                for(var i =0; i < list.length ; i++) {
//                    callback(list[i] , i);
//                }                
//            };
            
            nodeListForEach(fields, function(current, index) {
               // do something 
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';    
                } else {
                    current.textContent = '--';
                }
                
            });
        },
        
        displayMonth : function() {
            var now, year, month, monthName;
            now = new Date();
            //var cristmas = new Date(2020, 11, 25); 0-based
            monthName = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = monthName[month] + ' ' +year;
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputValue + ',' +
                DOMstrings.inputDescription
            );
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
            
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
        
    };
    
})();

var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
    
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. display the budget on the UI  
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
        // 1. calcuate the percentages
        budgetCtrl.calculatePercentages();
        
        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem  = function() {
        
        var input, newItem;
        
        // 1. get the field input data
        input = UICtrl.getInput();
            //console.log(input);
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();
            
            // 6. calculate and update percentages
            updatePercentages();

        }
          
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            // inc-1,exp-1...
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            
            // 1, delete item from the datastructure
            budgetCtrl.deleteItem(type, id);
            
            // 2. delete item from UI
            UICtrl.deleteListItem(itemID);
            
            // 3. update and show the new budget
            updateBudget();
            
            // 4. calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1 
            })
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);


// initialize eventListners
controller.init();