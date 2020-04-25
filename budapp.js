
//BUDGET CONTROLLER
var budgetController = (function() {

   var Expense = function(id, description, value){
       this.id = id,
       this.description = description;
       this.value = value;
       this.percentage = -1;
   };
    Expense.prototype.calcPercentages = function(totalIncome){
        if(totalIncome >0 ){
            this.percentage = Math.round((this.value / totalIncome) * 100);

        } else{
            this.percentage =-1;
        }    
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

   var Income = function(id, description, value){
    this.id = id,
    this.description = description;
    this.value = value;
   };

   var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
   };
  
   var data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
   };

   return{
       addItem: function(type, des, val){
           var newItem,ID;
           //create new id
           if(data.allItems[type].length >0){
            ID = data.allItems[type][data.allItems[type].length -1].id+1;
           } else{
               ID = 0;
           }
            
        //create a new item based on inc exp type
        
           if( type === 'exp'){
               newItem =  new Expense(ID, des, val);
           } else if (type ==='inc'){
               newItem = new Income(ID, des, val);
           }
           //push to data structure
           data.allItems[type].push(newItem);

           //return the new element
           return newItem;
       
       },

       deleteItem: function(type, id){
           var ids, index; 
          
           ids = data.allItems[type].map(function(current){
            return current.id;
           });

           index = ids.indexOf(id);
           if (index !== -1) {
            data.allItems[type].splice(index, 1);
           }

       },

       calculateBudget: function() {
           //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
           
            //cal a budget income - expenses
            data.budget = (data.totals.inc - data.totals.exp);
           
            // cal percentage if income that we spent
            if(data.totals.inc > 0 ){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            /*
            a=20%
            b=10%
            c=40%
            income 100
            */
           data.allItems.exp.forEach(function(cur){
            cur.calcPercentages(data.totals.inc);
           });
        },

        getPercentage: function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;

        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing: function(){
           console.log(data);
       }
   }

})();

//взаимодействие со страницей

var UIController = (function(){

    let elements = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue:'.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage'
        
    };

       /*используем Ф в других контроллерах
       поэтому не приватная, а паблик Ф
       поэтому должна быть в объекте, который вернет эта  Ф
       */
       return{
            getinput: function(){
                return{
                   type: document.querySelector(elements.inputType).value, //will be either inc or exp (это плюс и минус)
                   description: document.querySelector(elements.inputDescription).value,
                   value: parseFloat(document.querySelector(elements.inputValue).value)
                
                };
            },

            addlistItem: function(obj, type){

            var html, newHtml, element;
                //create html string with placeholder text
                if (type ==='inc'){
                    element = elements.incomeContainer;
               html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                } else if(type === 'exp') {  
                    element = elements.expensesContainer;
               html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }       

                //replace the placeholder text with actual data

                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', obj.value);
                
                //insert the html into the DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            },

            deleteListItem: function(selectorID){

                var el = document.getElementById(selectorID);
                el.parentNode.removeChild(el);
            },

            clearFields: function(){
                var fields, fieldArr;
                fields= document.querySelectorAll(elements.inputDescription + ',' + elements.inputValue);

                fieldArr = Array.prototype.slice.call(fields);
                fieldArr.forEach(function(current, index, array){
                    current.value = "";
                });
                
                fieldArr[0].focus();
                               
            },
            displayBudget: function(obj){
                document.querySelector(elements.budgetLabel).textContent = obj.budget;
                document.querySelector(elements.incomeLabel).textContent = obj.totalInc;
                document.querySelector(elements.expensesLabel).textContent = obj.totalExp;
                                
                if (obj.percentage > 0) {
                    document.querySelector(elements.percentageLable).textContent = obj.percentage + '%';
                } else {
                    document.querySelector(elements.percentageLable).textContent = '---';
                }
            },

                displayPercentages: function(percentages){
                    var labels;
                labels = document.querySelectorAll(elements.expensesPercLabel);

                    var NodeListForEach = function(list, callback){
                        for(var i = 0; i<list.length; i++){
                            callback(list[i],i);
                        }
                    };


                NodeListForEach(labels, function(current,index){
                    if(percentages[index]>0) {
                        current.textContent = percentages[index] + '%';
                    } else{
                        current.textContent = '---';
                    }
                });

             },


            getElements: function(){
                return elements; 
            } 
        };

})();

 
//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

    var Elements = UICtrl.getElements();

    var setupEventLesteners = function(){
        document.querySelector(Elements.inputButton).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
           
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(Elements.container).addEventListener('click', ctrlDeleteItem);
    };

    var UpdateBudjet =function(){
        // 1. Calc the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    var UpdatePercentages = function(){
        //calc the %
        budgetCtrl.calculatePercentages();

        //read them from the budget controller
        var percentages = budgetCtrl.getPercentage();

        //update the UI withh the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;
            // 1. Достаем инпут
            //рeзультат метода получаем инпут и это метод var

            var input = UICtrl.getinput();
            

            if (input.description !== ""  && !isNaN(input.value) && input.value > 0){
                 // 2. Add the item to the budget controller
             var newItem = budgetCtrl.addItem(input.type, input.description, input.value)
           
             // 3. Add new item to the UI
 
             UIController.addlistItem(newItem, input.type);
             
             // 4. clear the fiels
 
             UIController.clearFields();
            
             // 5. Calculate and update the budget
              
             UpdateBudjet();
             
             //6.update %
            UpdatePercentages();
            }
             
            
    };
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID){
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. удалить элемент из структуры данных
            budgetCtrl.deleteItem(type, ID);

            //2. удалить элемент из UI 
            UICtrl.deleteListItem(itemID);

            //3. обновить и показать новый бюджет
            UpdateBudjet();

            //4.update %
            UpdatePercentages();
        }
    };

    return{
        init: function(){
            console.log('Appliction has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventLesteners();
        }
    };


})(budgetController, UIController);

controller.init();
