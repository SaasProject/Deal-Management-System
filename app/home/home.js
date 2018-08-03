(function(){
    'use strict';

    angular
        .module('app')
        .controller('HomeController', Controller);
    
    function Controller($scope, $rootScope, $state, UserService, ModulesService, InputValidationService, ngToast, $stateParams) {  
       
        function getTimeStamp(myDate){
            var newDate=myDate[1]+"/"+myDate[2]+"/"+myDate[0];
            return new Date(newDate).getTime();
        }

        function getMonthOnly(myDate){
            var newDate=myDate[1]+"/"+myDate[2]+"/"+myDate[0];
            return new Date(newDate).getMonth() + 1;
        }

        var deals = {};
        var allBUs = {};
        var selectBU = [1, 2, 3];

        ModulesService.getAllModuleDocs('businessunits').then(function(businessUnits) {
          console.log(businessUnits);
          selectBU = businessUnits;
        }).catch(function(err) {

        });

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
                deals = allDeals;
                loadBUs();
            }).catch(function (err) {

            });
        }

        init();

        function loadBUs(){
            ModulesService.getAllModuleDocs('businessunits').then(function(businessUnits) {                
               allBUs = businessUnits;
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
                console.log(getTimeStamp('2018/1/1'));

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

            console.log(dealPerUniqueMonth);

            let unique = (names) => names.filter((v,i) => names.indexOf(v) === i);
            dealPerUniqueDate = unique(dealPerUniqueDate);
            dealPerUniqueMonth = unique(dealPerUniqueMonth);
            console.log(dealPerUniqueMonth);
            
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

            console.log(dealRevenueLevel1);
            console.log(dealRevenueLevel2);
            console.log(dealRevenueLevel3);
            console.log(dealRevenueLevel4);

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
                console.log(deals[j].profile['Level']+' '+deals[j].profile.Revenue+' '+getMonthOnly(monthly)+' '+deals[j].essential['Due Date']);

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

            console.log(dealRevenueLevel1);
            console.log(dealRevenueLevel2);
            console.log(dealRevenueLevel3);
            console.log(dealRevenueLevel4);

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
                  //align: 'left',
                  marginTop: 7
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
                text: 'Revenue Per Level'
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
                  values:dealRevenueLevel1
                },
                {
                  values:dealRevenueLevel2
                },
                {
                  values:dealRevenueLevel3
                },
                {
                  values:dealRevenueLevel4
                }
              ]
            };
             
            zingchart.render({ 
                id : 'revPerDevChart', 
                data : revPerDevChart, 
                height: "100%",
                width: "100%"
            });

            /*var myPie = {
                type: "pie", 
                plot: {
                  borderColor: "#2B313B",
                  borderWidth: 3,
                  // slice: 90,
                  valueBox: {
                    placement: 'out',
                    text: '%t\n%npv%'
                  },
                  tooltip:{
                    fontSize: '18',
                    padding: "5 10",
                    text: "%npv%"
                  },
                  animation:{
                  effect: 2, 
                  method: 5,
                  speed: 900,
                  sequence: 1,
                  delay: 3000
                }
                },
                source: {
                  text: 'gs.statcounter.com',
                  fontColor: "#8e99a9",
                  fontFamily: "Open Sans"
                },
                title: {
                  fontColor: "#8e99a9",
                  text: 'Global Browser Usage',
                  align: "left",
                  offsetX: 10,
                  fontSize: 25
                },
                subtitle: {
                  offsetX: 10,
                  offsetY: 10,
                  fontColor: "#8e99a9",
                  fontSize: "16",
                  text: 'May 2016',
                  align: "left"
                },
                plotarea: {
                  margin: "20 0 0 0"  
                },
                series : [
                    {
                        values : [11.38],
                        text: "Internet Explorer",
                      backgroundColor: '#50ADF5',
                    },
                    {
                      values: [56.94],
                      text: "Chrome",
                      backgroundColor: '#FF7965',
                      detached:true
                    },
                    {
                      values: [14.52],
                      text: 'Firefox',
                      backgroundColor: '#FFCB45',
                      detached:true
                    },
                    {
                      text: 'Safari',
                      values: [9.69],
                      backgroundColor: '#6877e5'
                    },
                    {
                      text: 'Other',
                      values: [7.48],
                      backgroundColor: '#6FB07F'
                    }
                ]
            };
             
            zingchart.render({ 
                id : 'pieChart', 
                data : myPie, 
                height: 350, 
                width: 500 
            });*/
        }
    }
})();