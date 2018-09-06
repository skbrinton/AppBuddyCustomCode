/**
 * On grids with groupings it displays the 1st group on the parent as clickable links next to the grid title
 * Usually a user can't see all the groups on the grid all at once, but this way they can
 * On click of the link the grid reloads with an fpf/fpv filter for the group the user clicked on
 * This file covers the use case when the grouping data contains the grouping name, but we need the owner id to populate the link's fpv param,
 * so we do an additional lookup to get the ids for all groups
 */

var __sfdcSessionId = sId; // used by the ajax toolkit, sId is the session Id exposed on Grid.page
//set this to true if the fpv params has to be populated with the id, not the name
var lookupId = true;
//if groupingkey is present, then the value of it will be displayed next to the owner of the group in the list
var groupingKey = 'SUM_Amount';
//if currency prefix is present then the grouping key's value is going to be formatted and the currency prefix is displayed
var currencyPrefix = '$';
var lookupObjName = 'User';

// DO NOT MODIFY ANYTHING BELOW THIS LINE

var parentObjName = gridInfoMap.p.gridApiName;
var groupByField = gridInfoMap.p.groupByFields[0];
var groupByMetaCol = getMetaColByFieldName(gridInfoMap.p, groupByField) || {};
var groupByAlias = groupByMetaCol.groupByAlias || '';
var gridId = getUrlVars()['gname'];
var groupings = location.search.indexOf('fpf') === -1 ? objectNameToAggregateResults[parentObjName] : typeof(Storage) !== "undefined" ? getGroupingsFromStorage(gridId) :[];
var linkStyle = 'margin-right: 10px; margin-bottom: 4px; display: inline-block; color: #0070d2;';

// import the ajax toolkit
if(lookupId && groupByField){
  jq.ajax({
    url: '/soap/ajax/36.0/connection.js',
    dataType: 'script',
    success: function() {
      jq(document).ready(function() {
        var names = getRecordNames();
        if(names){
          getOwners(names);
        }
      });
    },
    async: false
  });
}
else{
  displayGroups();
}

function getOwners(names) {
  var state = { // state that you need when the callback is called
      output : null,
      startTime : new Date().getTime()};

  var callback = {
      //call layoutResult if the request is successful
      onSuccess: displayGroups,

      //call queryFailed if the api request fails
      onFailure: queryFailed,
      source: state};

  sforce.connection.query(
    "Select Id, Name From " + lookupObjName + " where User.Name in ("+names+")", callback)
}

function queryFailed(error, source) {
  console.log(error);
  alert("An error occurred. \nPlease contact the KPSC Help Desk for further assistance.");
}

function getRecordNames(){
  var names = "";
  if(groupings){
    for(var i = 0, len = groupings.length; i < len; i++){
        names += "'" + groupings[i][groupByAlias] + "'" + ','
    }
    //remove trailing comma
    names = names.substring(0, names.length-1);
  }
  return names;
}

function displayGroups(queryResult, source){
  var containerStyle = 'margin-left: 20px; font-size: 14px; display: inline-block; width: 70%; vertical-align: middle; position: relative; bottom: 1px;';
  var groupingButtons;
  var owners = [];
  if (queryResult && queryResult.size > 0) {
    owners = queryResult.getArray('records');
  }
  if (groupings !== undefined) {
    groupingButtons = groupings.reduce(function(accumulator, item) {
      var key = item[groupByAlias];
      var fpv = key;
      var value = '';
      if(groupingKey && item[groupingKey]){
        value += ': ';
        value += currencyPrefix ? currencyPrefix + GBHelpers.formatNumber(item[groupingKey]) : item[groupingKey];
      }
      if (key !== null) {
        for (var i = 0; i < owners.length; i++) {
          var owner = owners[i];
          if(owner.Name == key){
            fpv = owner.Id;
            break;
          }
        }
        accumulator += '<li class="ui-menu-item" style="padding: .1em .4em;"><a href="' + getLinkUrl(groupByField, fpv) + '" style="' + linkStyle + '">' + key + value + '</a></li>'
      }
      return accumulator
    }, []);

    if(groupByField && (location.search.indexOf('fpf') === -1 || (location.search.indexOf('fpf') > -1 && typeof(Storage) !== "undefined"))){
      jq('.gridBtnsContainer').append(createGroupMenu(groupingButtons));
      addEventListeners();
    }
    //fallback for old browsers where localstorage is not supported or pages where there are 0 records
    else if(location.search.indexOf('fpf') > -1 && (typeof(Storage) === "undefined" ||  !groupByField)){
      jq('.gridHeaderCell').append('<div class="groupingList" style="' + containerStyle + '"></div>');
      jq('.groupingList').append('<a href="' + getLinkUrl() + '" style="' + linkStyle + '">Back to All Groups</a>');
    }
    if (location.search.indexOf('fpf') === -1 && typeof(Storage) !== "undefined") {
      sessionStorage[gridId] = JSON.stringify(groupings);
    }
  }
}

function getLinkUrl(fieldName, id) {
  var searchArr = location.search.replace('?', '').split('&');
  searchArr = searchArr.filter(function(item) {
    return item.indexOf('fpf') === -1 && item.indexOf('fpv') === -1
  });

  if (fieldName !== undefined) {
    searchArr.push('fpf=' + fieldName, 'fpv=' + id);
  }

  return location.origin + location.pathname + '?' + searchArr.join('&');
}

function createGroupMenu(groupingLinks){
  var allGroupsLink = location.search.indexOf('fpf') === -1 ? '' : '<li class="ui-menu-item" style="padding: .1em .4em;"><a href="' + getLinkUrl() + '" style="' + linkStyle + '">All Groups</a></li>'
  return '<span id="groupsWrapper" class="groupBtnContainer" style="position:relative; display:inline-block;">'
              + '<button id="showGroupsBtn" class="gbBtn showBtn toggleRecords" type="button">Select group<span class="ui-icon ui-icon-triangle-1-s">&nbsp;</span></button>'
              + '<div class="showMenu" style="right: 1px">'
                + '<ul id="groupsMenu" class="gbActionsMenu gbShowMenu boxShadow ui-menu ui-widget ui-widget-content" style="min-width:215px; position: relative; top: 0px; right: 1px; display: none;">'
                  + allGroupsLink
                  + groupingLinks
                + '</ul>'
              + '</div>'
            + '</span>'
}

function addEventListeners(){
  var groupsBtn = jq('#showGroupsBtn');
  var groupsMenu = jq('#groupsMenu');
  if(groupsBtn.length){
    groupsBtn.click(function(){
      groupsMenu.toggle();
    });
    jq(document).click(function(e){
      if(jq(e.target).closest('#groupsWrapper').length == 0){
        groupsMenu.hide();
      }
    })
  }
}

function getGroupingsFromStorage(gridId){
  if(sessionStorage[gridId]){
      return JSON.parse(sessionStorage[gridId]);
    }
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
