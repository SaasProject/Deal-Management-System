(function(){
    'use strict';

    angular
        .module('app')
        .controller('HomeController', Controller);
    
    function Controller($scope, $rootScope, $state, UserService, ModulesService, InputValidationService, ngToast, $stateParams) {  
       
        function getTimeStamp(myDate){
            var newDate = myDate[1] + "/" + myDate[2] + "/" + myDate[0];
            return new Date(newDate).getTime();
        }

        function getMonthOnly(myDate){
            var month = new Array();
            month[0] = "Jan";
            month[1] = "Feb";
            month[2] = "Mar";
            month[3] = "Apr";
            month[4] = "May";
            month[5] = "Jun";
            month[6] = "Jul";
            month[7] = "Aug";
            month[8] = "Sep";
            month[9] = "Oct";
            month[10] = "Nov";
            month[11] = "Dec";

            var newDate = myDate[1] + "/" + myDate[2] + "/" + myDate[0];
            var month = month[new Date(newDate).getMonth()];
            var year = new Date(newDate).getFullYear();
            return month + ' ' + year;
        }

        var monthNames = {
          "Apr": 1,
          "May": 2,
          "Jun": 3,
          "Jul": 4,
          "Aug": 5,
          "Sept": 6,
          "Oct": 7,
          "Nov": 8,
          "Dec": 9,
          "Jan": 10,
          "Feb": 11,
          "Mar": 12
        };

        var deals = {};
        var allBUs = {};
        $scope.optionsBU = '';
        $scope.selectedBU = '--ALL--';
        $scope.selectedDiv = '--ALL--';
        //$scope.stackedOptions = 'Revenue';
        $scope.isGD = true;
        $scope.isESD = false;

        //for time series
        var dealRevenuePerDate = [];
        var dealCMPerDate = [];

        //per stack
        var dealRevenueLevel1 = [];
        var dealRevenueLevel2 = [];
        var dealRevenueLevel3 = [];
        var dealRevenueLevel4 = [];

        //per deal
        var dealRevenue = [];
        var dealCM = [];

        //revenue percentage per dev
        var revenuePerDev = [];

        //revenue per unique date
        var dealPerUniqueDate = [];

        //revenue per unique month
        var dealPerUniqueMonth = [];

        var isInit = false;

        function init(){
            ModulesService.getAllModuleDocs('deals').then(function (allDeals) {
                console.log(allDeals);
                if($scope.selectedDiv != '--ALL--'){

                  for(var i = 0; i < allDeals.length; i++){
                    if($scope.selectedDiv == 'GD'){
                      if(allDeals[i].profile['AWS Resp (Dev) BU'] != 'Dev A'){
                        deals.push(allDeals[i]);
                      }
                    }else if($scope.selectedDiv == 'ESD'){
                      if(allDeals[i].profile['AWS Resp (Dev) BU'] == 'Dev A'){
                        deals.push(allDeals[i]);
                      }
                    }
                  }
                  
                }else{
                  if($scope.selectedBU == '--ALL--'){
                    deals = allDeals;
                  } else {
                    for(var i = 0; i < allDeals.length; i++){
                      if(allDeals[i].profile['AWS Resp (Dev) BU'] == $scope.selectedBU){
                        deals.push(allDeals[i]);
                      }
                    }
                  }
                }
                
                //console.log(deals.length);
                loadBUs();
            }).catch(function (err) {

            });
        }

        init();

        $scope.reloadAll = function(){
          //console.log($scope.selectedBU);
          deals = [];
          dealRevenuePerDate = [];
          dealCMPerDate = [];
          dealRevenueLevel1 = [];
          dealRevenueLevel2 = [];
          dealRevenueLevel3 = [];
          dealRevenueLevel4 = [];
          dealRevenue = [];
          dealCM = [];
          revenuePerDev = [];
          dealPerUniqueDate = [];
          dealPerUniqueMonth = [];
          init();
        }

        function loadBUs(){
            ModulesService.getAllModuleDocs('businessunits').then(function(businessUnits) {                
               allBUs = businessUnits;
               $scope.optionsBU = businessUnits;
               loadCharts();
            }).catch(function(err) {

            });
        }

        function loadCharts() {
            
            var totalRev = 0;

            //to load data on revenue bar chart
            for(var j = 0; j < deals.length; j++){
                
                var monthly = deals[j].essential['Due Date'].split('/');

                dealPerUniqueDate.push(getTimeStamp(monthly));
                dealPerUniqueMonth.push(getMonthOnly(monthly));
                //console.log(getTimeStamp('2018/1/1'));

                /*if(isNaN(deals[j].profile.Revenue)){
                    dealRevenue.push(0);
                }else{
                    dealRevenue.push(deals[j].profile.Revenue);

                    //accumulate all revenues
                    totalRev += deals[j].profile.Revenue;
                }

                if(isNaN(deals[j].profile.CM)){
                    dealCM.push([deals[j].ID, 0]);
                }else{
                    dealCM.push([deals[j].ID, deals[j].profile.CM]);
                }*/
            }

            //console.log(dealPerUniqueMonth);

            let unique = (names) => names.filter((v,i) => names.indexOf(v) === i);
            dealPerUniqueDate = unique(dealPerUniqueDate);
            dealPerUniqueMonth = unique(dealPerUniqueMonth);
            //console.log(dealPerUniqueMonth);
            
            //initialize time series deals
            for(var i = 0; i < dealPerUniqueDate.length; i++){
              dealRevenuePerDate.push([dealPerUniqueDate[i], 0]);
              dealCMPerDate.push([dealPerUniqueDate[i], 0]);
            }

            //initialize stacked chart deals
            for(var i = 0; i < dealPerUniqueMonth.length; i++){
              dealRevenueLevel1.push([dealPerUniqueMonth[i], 0]);
              dealRevenueLevel2.push([dealPerUniqueMonth[i], 0]);
              dealRevenueLevel3.push([dealPerUniqueMonth[i], 0]);
              dealRevenueLevel4.push([dealPerUniqueMonth[i], 0]);
            }

            /*console.log(dealRevenueLevel1);
            console.log(dealRevenueLevel2);
            console.log(dealRevenueLevel3);
            console.log(dealRevenueLevel4);*/

            //load data in revenue line chart
            for(var j = 0; j < deals.length; j++){
              var monthly = deals[j].essential['Due Date'].split('/');

              for(var k = 0; k < dealRevenuePerDate.length; k++){
                if(dealRevenuePerDate[k][0] == getTimeStamp(monthly)){
                  if(isNaN(deals[j].profile.Revenue)){
                    dealRevenuePerDate[k][1] += 0;
                  }else{
                    dealRevenuePerDate[k][1] += deals[j].profile.Revenue;
                  }
                }
              }

              for(var k = 0; k < dealCMPerDate.length; k++){
                if(dealCMPerDate[k][0] == getTimeStamp(monthly)){
                  if(isNaN(deals[j].profile.CM)){
                    dealCMPerDate[k][1] += 0;
                  }else{
                    dealCMPerDate[k][1] += deals[j].profile.CM;
                  }
                }
              }
            }

            //console.log(dealRevenuePerDate);

            //console.log(totalRev);

            //console.log(allBUs);

            //initialize revenuePerDev
            for(var j = 0; j < allBUs.length; j++){
                revenuePerDev.push([allBUs[j].BU, 0]);
            }           

            //load data on hbar chart
            for(var j = 0; j < deals.length; j++){
                var monthly = deals[j].essential['Due Date'].split('/');
                /*console.log(deals[j].profile['Level'] + ' ' + deals[j].profile.Revenue + ' ' + 
                  getMonthOnly(monthly) + ' ' + deals[j].essential['Due Date']);*/



                //level 1
                for(var k = 0; k < dealRevenueLevel1.length; k++){
                  if(dealRevenueLevel1[k][0] == getMonthOnly(monthly) && deals[j].profile['Level'] == 1){
                    if(isNaN(deals[j].profile.Revenue)){
                      dealRevenueLevel1[k][1] += 0;
                    }else{
                      dealRevenueLevel1[k][1] += deals[j].profile.Revenue;
                    }
                  }
                }

                //level 2
                for(var k = 0; k < dealRevenueLevel2.length; k++){
                  if(dealRevenueLevel2[k][0] == getMonthOnly(monthly) && deals[j].profile['Level'] == 2){
                    if(isNaN(deals[j].profile.Revenue)){
                      dealRevenueLevel2[k][1] += 0;
                    }else{
                      dealRevenueLevel2[k][1] += deals[j].profile.Revenue;
                    }
                  }
                }

                //level 3
                for(var k = 0; k < dealRevenueLevel3.length; k++){
                  if(dealRevenueLevel3[k][0] == getMonthOnly(monthly) && deals[j].profile['Level'] == 3){
                    if(isNaN(deals[j].profile.Revenue)){
                      dealRevenueLevel3[k][1] += 0;
                    }else{
                      dealRevenueLevel3[k][1] += deals[j].profile.Revenue;
                    }
                  }
                }

                //level 4
                for(var k = 0; k < dealRevenueLevel4.length; k++){
                  if(dealRevenueLevel4[k][0] == getMonthOnly(monthly) && deals[j].profile['Level'] == 4){
                    if(isNaN(deals[j].profile.Revenue)){
                      dealRevenueLevel4[k][1] += 0;
                    }else{
                      dealRevenueLevel4[k][1] += deals[j].profile.Revenue;
                    }
                  }
                }
            }

            //dealRevenueLevel1.sort(function(a, b) { return monthNames[a[0].split(' ')[0]] - monthNames[b[0].split(' ')[0]];});

            /*console.log(dealRevenueLevel1);
            console.log(dealRevenueLevel2);
            console.log(dealRevenueLevel3);
            console.log(dealRevenueLevel4);*/

            //sort deals revenue level by month
            dealRevenueLevel1.sort(function(a, b) {
             return monthNames[a[0].split(' ')[0]] - monthNames[b[0].split(' ')[0]];
            });
            dealRevenueLevel2.sort(function(a, b) {
              return monthNames[a[0].split(' ')[0]] - monthNames[b[0].split(' ')[0]];
            });
            dealRevenueLevel3.sort(function(a, b) {
              return monthNames[a[0].split(' ')[0]] - monthNames[b[0].split(' ')[0]];
            });
            dealRevenueLevel4.sort(function(a, b) {
              return monthNames[a[0].split(' ')[0]] - monthNames[b[0].split(' ')[0]];
            });

            renderCharts();
        }

        function renderCharts(){
            //console.log(revenuePerDev);
            //console.log(dealRevenuePerDate);
            //console.log(getTimeStamp([new Date().getFullYear(), '04', '01']));

            //zingchart.DEV.DEBOUNCESPEED = 50; 

            var dealsData = {
                type: 'line',  // Specify your chart type here.
                title: {
                  text: 'Deals Revenue Per Date',
                  adjustLayout: true,
                  marginTop: 5
                },
                legend: {
                  align: 'center',
                  verticalAlign: 'top',
                  backgroundColor:'none',
                  borderWidth: 0,
                  item:{
                    cursor: 'hand'
                  },
                  marker:{
                    type:'circle',
                    borderWidth: 0,
                    cursor: 'hand'
                  }
                },
                plotarea:{
                  margin:'dynamic 70'
                },
                plot:{
                  //stacked: true,
                  aspect: 'spline',
                  lineWidth: 2,
                  marker:{
                    borderWidth: 0,
                    size: 5
                  }
                },
                preview:{
                  adjustLayout: true,
                  borderColor:'#E3E3E5',
                  mask:{
                    backgroundColor:'#E3E3E5'
                  }
                },
                scaleY:{
                  short:true,
                  shortUnit:"K"
                },
                scaleX:{
                  minValue: getTimeStamp([new Date().getFullYear(), '04', '01']),
                  maxValue: getTimeStamp([new Date().getFullYear() + 1, '03', '31']),
                  zooming: true,
                  zoomTo:[0,15],
                  step: 'day',
                  transform:{
                    type: 'date',
                    all: '%M %d'
                  }
                },
                series: [  // Insert your series data here.
                  { values : dealRevenuePerDate.sort(), text: 'Revenue' },
                  { values : dealCMPerDate.sort(), text: 'CM' }
                ]
            };
            zingchart.render({
                id: 'dealsChart',
                data: dealsData,
                height: "100%",
                width: "100%"
            });

            var chartData = {
                type: 'bar',  // Specify your chart type here.
                title: {
                text: 'Deals Revenue Per Deal',
                adjustLayout: true,
                marginTop: 7
                },
                legend: {
                  align: 'center',
                  verticalAlign: 'right',
                  backgroundColor:'none',
                  borderWidth: 0,
                  item:{
                    cursor: 'hand'
                  },
                  marker:{
                    type:'circle',
                    borderWidth: 0,
                    cursor: 'hand'
                  }
                },         
                series: [  // Insert your series data here.
                  { values : dealRevenue, text: 'Revenue' },
                  { values : dealCM, text: 'CM' }
                ]
            };
            zingchart.render({
                id: 'chartDiv',
                data: chartData,
                height: "100%",
                width: "100%"
            });

            var revPerDevChart = {
              type: "bar",
              stacked: true,
              title: {
                text: 'Revenue Per Level',
                adjustLayout: true
              },
              plot:{
                valueBox:{
                  placement:"top-out",
                  short:true
                }
              },
              legend: {
                align: 'center',
                verticalAlign: 'top',
                backgroundColor:'none',
                borderWidth: 0,
                item:{
                  cursor: 'hand'
                },
                marker:{
                  type:'circle',
                  borderWidth: 0,
                  cursor: 'hand'
                },

              },
              scaleY: {
                short:true,
                shortUnit:"K"
              },
              scaleX: {
                /*minValue: getTimeStamp('1900', '4', '1'),
                maxValue: getTimeStamp('1901', '3', '31'),
                transform:{
                  type: 'date',
                  all: '%M %d'
                }*/
              },
              series: [
                {
                  values:dealRevenueLevel1, text: 'Level 1'
                },
                {
                  values:dealRevenueLevel2, text: 'Level 2'
                },
                {
                  values:dealRevenueLevel3, text: 'Level 3'
                },
                {
                  values:dealRevenueLevel4, text: 'Level 4'
                }
              ]
            };
             
            zingchart.render({ 
                id : 'revPerDevChart', 
                data : revPerDevChart, 
                height: "100%",
                width: "100%"
            });
        }
    }
})();