"use strict";
const _ = require('lodash');
const stores = require('./stores.json').stores;
const fs = require('fs');
let storeImports = [];

let storeFlags = function(store) {
	let flags = [];

	if (store.showProductAisleNumber) {
		flags.push("productAisleNumber");
	}
	if (store.showProductBayNumber) {
		flags.push("productBayNumber");
	}
	if (store.showMetaProducts) {
		flags.push("metaProducts");
	}
	if (store.showStoreMapView) {
		flags.push("storeMapView");
	}
	if (store.showInStockPageView) {
		flags.push("inStockPageView");
	}
	if (store.showProductLocations) {
		flags.push("productLocations");
	}
	if (store.leadCaptureEnabled) {
		flags.push("leadCapture");
	}

	return JSON.stringify(flags);
};

let zeroPad = function(num, count) {
    var numZeroPad = num.toString();
    while (numZeroPad.length < count) {
        numZeroPad = "0" + numZeroPad;
    }
    return numZeroPad;
};

_.forEach(stores, function(store, index){
	let storeModel = `INSERT INTO storeservices.stores (
	  storeid,
	  address1, city, country,
	  fridayopen, fridayclose, mondayopen,
	  mondayclose, saturdayopen, saturdayclose,
	  sundayopen, sundayclose, thursdayopen,
	  thursdayclose, tuesdayopen, tuesdayclose,
	  wednesdayopen, wednesdayclose, fax,
	  flags, isonboardedstore, latitude,
	  longitude, mapurl, milestostore,
	  phone, state, storename, storenumber, zip
	  ) VALUES ( ${index+1}, '${store.ADDRESS.replace(/\'/g, "''")}', '${store.CITY.replace(/\'/g, "''")}', '${store.CNTY.replace(/\'/g, "''")}',
	    25200, 75600, 25200, 75600,
	    25200, 75600, 28800, 68400,
	    25200, 75600, 25200, 75600,
	    25200, 75600, '${store.FAX}',
	    ${storeFlags(store).replace(/\"/g, "'")},
	    'true', '${store.LAT}', '${store.LNG}',
	    'http://mobilepti.lowes.com/staticmap?api_key=977b2334e34711e18edc12313d23aa6e&devid=%7BdevId%7D&storeId=${store.LOCN_NBR}&size=1024x1024',
	    '7.29', '${store.PHN}', '${store.STE.replace(/\'/g, "''")}',
	    '${store.BIS_NM.replace(/\'/g, "''")}', '${zeroPad(store.LOCN_NBR, 4)}', '${store.ZIP}' );
	`;

	storeImports.push(storeModel);
});

fs.writeFile("stores.cql", storeImports.join("\n"), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 