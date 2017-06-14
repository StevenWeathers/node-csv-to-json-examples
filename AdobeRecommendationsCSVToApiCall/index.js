var csvFileName = 'test.csv'; // the CSV file with KEY | entityId | entityId columns for recs data
var algorithmName = 'RelatedItems'; // the Algorithm Name to post the data to
var keyType = 'currentitem'; // the key to recommend off of
var hostGroup = 'Production'; // the host group to tie the data to

var client = 'retailstore'; // the API client
var clientToken = 'put-api-key-here'; // the API token

var parse = require('csv-parse'); // to parse csv
var _ = require('lodash'); // utils
var request = require('request'); // to make api call (post)
var fs = require('fs'); // to load the csv file
var recsCsv = fs.readFileSync(csvFileName,'utf8'); // recs csv file to parse
var recCalls = 0;

request('https://recommendations.omniture.com/rest?action=algorithm.upload&client='+client+'&clientToken='+clientToken+'&algorithmName='+algorithmName+'&keyType='+keyType, function(error,response,body){
	console.log('Algorithm Created');
	console.log(body);
});

var postRecs = function(recs){
	var recsToPost = '<recommendations>'+recs+'</recommendations>';
	// make the post request to adobe recs to upload the data
	// current limit of 1,000 KEY's per request
	request.post('https://recommendations.omniture.com/rest?action=entity.recommendations.upload&client='+client+'&hostGroup='+hostGroup+'&clientToken='+clientToken+'&algorithmName='+algorithmName, {form:{recommendations: recsToPost}}, function(error,response,body){
		++recCalls;
		console.log('Set #: '+recCalls + ' Call Start');
		console.log(body);
		console.log('Set #: '+recCalls + ' Call End');
	});
};

// parse the recs csv to build out xml and make the api call
parse(recsCsv, function(err, output){
	var recommendations = [[]]; // primary recommendations array
	var setIndex = 0;
	// loop through each recommendation to build into xml
	_(output).forEach(function(recommendation, index) {
		// remove empty indexes from array
		recommendation = _.filter(recommendation, Boolean);
		// split into arrays of 1000 to handle call limits
		if (!recommendations[setIndex]) {
			recommendations[setIndex] = [];
		} else if (recommendations[setIndex].length === 1000) {
			++setIndex;
			recommendations[setIndex] = [];
		}
		// if csv headers do nothing
		if (recommendation[0] === 'Key') {
			return;
		}
		// start a new array for the recommendation
		var recs = ['<recommendation>'];
		// get recommendation key and push to the new array
		var key = recommendation[0];
		recs.push('<key>'+key+'</key>');
		// remove recommendation key from array
		recommendation.shift();
		// build out entityId's into new array
		_(recommendation).forEach(function(rec) {
			recs.push('<entityId>'+rec+'</entityId>'); // add entityId to array
		});
		// push end tag to array
		recs.push('</recommendation>');
		// join and push new array to recommendations master array
		// console.log(recommendations[setIndex]);
		recommendations[setIndex].push(recs.join(''));
	});

	// loop through each set of 1000 recs and send to adobe
	_(recommendations).forEach(function(recSet){
		postRecs(recSet.join(''));
	});
});