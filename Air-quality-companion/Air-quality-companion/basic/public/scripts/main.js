/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author 
 */

/** namespace. */
var rh = rh || {};

/** globals */
rh.COLLECTION_USERS = "Users";
rh.COLLECTION_CITIES = "Cities";
rh.KEY_FAVO = "Favorite";
rh.KEY_MAIN = "MainList";
rh.KEY_LAST_TOUCHED = "LastTouched";
rh.KEY_NAME = "Name";
rh.KEY_URL = "URL";
rh.KEY_TEMPO = "tempo"
firstAlert = true;

rh.mainpageManager = null;
rh.detailpageManager = null;
_ref1 = null;
cityData = {};
mainList = [];
currentCity = null;
favoriteLAT = null;
favoriteLNG = null;
FavC=null;



rh.User = class {
	constructor(uid, fav, list) {
		this.uid = uid;
		this.fav = fav;
		this.list = list;

	}
}

rh.City = class {
	constructor(name, url, tempo) {
		this.name = name;
		this.url = url;
		this.tempo = tempo

	}

}

rh.MainpageManager = class {
	constructor() {
		this._ref = firebase.firestore().collection(rh.COLLECTION_USERS);

		this._ref2 = firebase.firestore().collection(rh.COLLECTION_CITIES);
		_ref1 = window.location.href;
		this._documentSnapshots = [];
		this._documentSnapshots2 = [];
		this._unsubscribe = null;
	}

	beginListening(changeListener) {
		console.log("Listening for cities");
		this._ref.where("UID", "==", 1)
			.get()
			.then(function (querySnapshot) {
				querySnapshot.forEach(function (doc) {

					var data = doc.data();
					mainList = data.MainList;
					FavC=data.Favorite;
					console.log(mainList);
				});
			})
			.catch(function (error) {
				console.log("Error getting documents: ", error);
			});

		this._unsubscribe = this._ref2.orderBy(rh.KEY_NAME, "desc").limit(30).onSnapshot((querySnapshot) => {

			this._documentSnapshots = querySnapshot.docs;
			//console.log(this._documentSnapshots);


			if (changeListener) {
				changeListener();
			}
		});



	}

	stopListening() {
		this._unsubscribe();
	}

	addUser(uid) {
		this._ref.doc(uid).set({
			Favorite: "Vancouver",
			MainList: [Vancouver],
			LastTouched: Date.now,
			UID: uid
		})

	} 

	addCity(name) {
		var _ref1 = this._ref.doc("8msMeySS2uNL78P34rQ3");

		_ref1.update({
			MainList: firebase.firestore.FieldValue.arrayUnion(name)


		}).then((docRef) => {
			console.log("MainList added with new city: ", name);
			location.reload();
		}).catch((error) => {
			console.log("There was an error adding the document", error);
		});

	}


	get MainListLength() {
		return mainList.length;

	}

	get length() {
		return this._documentSnapshots.length;
	}

	getCityByName(name) {
		let k = 0;
		while (k < this.length) {
			let data = this._documentSnapshots[k].data();
			if (data.Name == name) {
				return new rh.City(
					data.Name,
					data.URL,
					data.tempo);
			}
			k++;
		}
	}

	getFavCityCor(name){
		var settings = {
			"url": this.getCityByName(name).url,
			"method": "GET",
			"timeout": 0,
			"async": false
		};
		$.ajax(settings).done(function (response) {
			favoriteLAT = response['data']['location']['coordinates'][1];
			favoriteLNG = response['data']['location']['coordinates'][0];
			localStorage.setItem("lng", favoriteLNG);
			localStorage.setItem("lat", favoriteLAT);
		});
		
	}


}



rh.ConfigpageManager = class {
	constructor() {}

}

rh.MappageManager = class {
	constructor() {}

}

rh.mappageController = class {
	constructor() {
		//rh.configpageManager.beginListening(this.updateView.bind(this));
		favoriteLNG = localStorage.getItem("lng");
		favoriteLAT = localStorage.getItem("lat");
		
		console.log(favoriteLAT)
		console.log(favoriteLNG);
		const url = "https://www.airvisual.com/air-quality-map?lat=" + favoriteLAT + "&lng=" + favoriteLNG + "&zoomLevel=10";
		$("#frame").attr('src', url);
		$("#backBtn").click((e) => {

			_ref1 = "https://aqic-2e4f4.firebaseapp.com/";
			window.location.href = _ref1;

		})
		$("#fab1").click((e) => {

			_ref1 = "https://aqic-2e4f4.firebaseapp.com/config.html";
			window.location.href = _ref1;
		})

		$("#submit").click((event) => {
		
			const element = $("#alarmInput").val();
			const level = $("#dataInput").val();
			localStorage.setItem("element", element);
			localStorage.setItem("level",level);
			$("#alarmInput").val("Alert Element");
			$("#dataInput").val("Set your level for alert");

		})

	}


}


rh.configpageController = class {
	constructor() {
		//rh.configpageManager.beginListening(this.updateView.bind(this));
		$("#backBtn").click((e) => {
			_ref1 = "https://aqic-2e4f4.firebaseapp.com/";
			window.location.href = _ref1;

		})
		$("#Map").click((e) => {
			_ref1 = "https://aqic-2e4f4.firebaseapp.com/map.html";
			window.location.href = _ref1;
		})

		$("#submitChangeFavCity").click((e)=>{
			const Favname = $("#inputFavCityName").val();
			firebase.firestore().collection(rh.COLLECTION_USERS).doc("8msMeySS2uNL78P34rQ3").update({
				Favorite: Favname
			
			})

		})
	}
}

rh.mainpageController = class {
	constructor() {
		rh.mainpageManager.beginListening(this.updateView.bind(this));

		var alerted = localStorage.getItem('alerted') || '';
		if (alerted != 'yes') {
			alert("The following cities are available with real time data:\n" +

				"Boston         San Francisco        Shanghai          Tokyo\n" +

				"Hong Kong     Beijing               New York          Terre Haute\n" +

				"Chicago      Vancouver");

			localStorage.setItem('alerted', 'yes');
		}

		$("#addCityDialog").on("show.bs.modal", function (e) {
			$("#inputCityName").val("");
		});
		$("#addCityDialog").on("shown.bs.modal", function (e) {
			$("#inputCityName").trigger("focus");
		});
		$("#submitAddCity").click((event) => {
			const name = $("#inputCityName").val();
			rh.mainpageManager.addCity(name);
		});
		$("#Map").click((e) => {
			console.log("should be on Map");
			//localStorage.setItem("lng",);
			//localStorage.setItem("lat");
			rh.mainpageManager.getFavCityCor(FavC);
			_ref1 = "https://aqic-2e4f4.firebaseapp.com/map.html";
			window.location.href = _ref1;
		})
		$("#addUserDialog").on("shown.bs.modal", function (e) {
			$("#Auth").trigger("focus");
		});
		$("#Auth").click((event) => {
			console.log("start removing");
			var i = 0;
			if(mainList.length==0){
				 _ref1 = "https://aqic-2e4f4.firebaseapp.com/auth.html";
			     window.location.href = _ref1;

			}else{
			while (i < mainList.length) {
				firebase.firestore().collection(rh.COLLECTION_USERS).doc("8msMeySS2uNL78P34rQ3").update({
					MainList: firebase.firestore.FieldValue.arrayRemove(mainList[i])
				}).then((docRef) => {
					console.log("MainList clears city: ", mainList[i]);
					location.reload();
					if (i = mainList.length) {

						_ref1 = "https://aqic-2e4f4.firebaseapp.com/auth.html";
						window.location.href = _ref1;
					}
				}).catch((error) => {
					console.log("There was an error adding the document", error);
				});
				i++;
				
				
			}
		}

			
		});
	}

	updateView() {
		$("#cities").removeAttr("id").hide();
		let $newList = $("<ul></ul>").attr("id", "cities").addClass("list-group");
		for (let k = 0; k < rh.mainpageManager.MainListLength; k++) {
			const cityname = mainList[k];
			const $newCard = this.createCityCard(
				rh.mainpageManager.getCityByName(cityname),
			);
			$newList.append($newCard);
		}
		$("#CityListContainer").append($newList);
	}

	createCityCard(city) {

		var settings = {
			"url": city.url,
			"method": "GET",
			"timeout": 0,
			"async": false
		};
		$.ajax(settings).done(function (response) {
			console.log(response);
			city.tempo = response['data']['current']['pollution']['aqius'];
			console.log(city.tempo);
		});
		const $newCard = $(`
		  <li id="${city.name}" class="city-card list-group-item city-container col-md-12">
			 <div class="city-card-name city">${city.name}</div>
			 <div class="gap"></div>
			 <div class="arrow"><span class="glyphicon glyphicon-arrow-up"></div>
			 <div class="city-card-tempo index"></span>${city.tempo}</div> 
		  </li>`);
		console.log("card created");
		$newCard.click((event) => {
			localStorage.setItem("url", city.url);
			localStorage.setItem("name", city.name);
			//currentCity = city;
			window.location.href = "https://aqic-2e4f4.firebaseapp.com/detail.html";
		});
		return $newCard;
	}
}

rh.AuthpageManager = class {
	constructor() {
		this._ref=firebase.firestore().collection(rh.COLLECTION_USERS);
	}

	beginAuthListening = function () {
		firebase.auth().onAuthStateChanged(function (user) {
			if (user) {
				// User is signed in.
				$("#uid").html(`<b>uid</b>: ${user.uid}`);
				$("#email").html(`<b>email</b>: ${user.email}`);
				$("#displayName").html(`<b>displayName</b>: ${user.displayName}`);
				$("#photoURL").attr("src", user.photoURL);
				$("#phoneNumber").html(`<b>phone #</b>: ${user.phoneNumber}`);
				console.log(user.providerData);
				
				console.log("A user IS signed in.  Uid = ", user.uid);
				//firebase.firestore().doc("Users/" + user.uid);
				//rh.mainpageManager.addUser(user.uid);
				 this._ref.doc(user.uid).set({
				 	Favorite: "Vancouver",
				 	MainList: [Vancouver],
				 	LastTouched: Date.now,
				 	UID: uid
				 })
				
				$("#firebaseui-auth-container").hide();
				$("#emailPassword").hide();
				$("#userInfo").show();
			} else {
				// User is signed out.
				console.log("There is no user.  Nobody is signed in.");
				$("#emailPassword").hide(); // Turned off for now.
				$("#firebaseui-auth-container").show();
				$("#userInfo").hide();
			}
		});
	}
}

rh.authpageController = class {
	constructor() {
		this.enableEmailPassword();
		rh.authpageManager.beginAuthListening();
		this.startFirebaseUi();
		$("#signOut").click((event) => {
			firebase.auth().signOut();
			_ref1 = "https://aqic-2e4f4.firebaseapp.com/";
			window.location.href = _ref1;
		});
	}

	enableEmailPassword = function () {
		const email = new mdc.textField.MDCTextField(document.querySelector('.email'));
		const password = new mdc.textField.MDCTextField(document.querySelector('.password'));
		new mdc.ripple.MDCRipple(document.querySelector('#createAccount'));
		new mdc.ripple.MDCRipple(document.querySelector('#login'));

		$("#createAccount").click((event) => {
			const emailValue = $("#email-input").val();
			const passwordValue = $("#password-input").val();
			console.log("Create a new user", emailValue, passwordValue);
			firebase.auth().createUserWithEmailAndPassword(emailValue, passwordValue).then(ok => {
				console.log("!!!!!");
				firebase.firestore().doc("Users/" + ok.uid);

			}).catch(function (error) {
				// CONSIDER: In a real tell the user what is wrong.

				console.log(`Error ${error.code}: ${error.message}`);
			});

		});
		$("#login").click((event) => {
			console.log("Log in an existing user");
			const emailValue = $("#email-input").val();
			const passwordValue = $("#password-input").val();
			console.log("Create a new user", emailValue, passwordValue);
			firebase.auth().signInWithEmailAndPassword(emailValue, passwordValue).catch(function (error) {
				// CONSIDER: In a real tell the user what is wrong.
				console.log(`Error ${error.code}: ${error.message}`);
			});
		});
	};

	startFirebaseUi = function () {
		// FirebaseUI config.
		var uiConfig = {
			signInSuccessUrl: '/',
			signInOptions: [
				firebase.auth.GoogleAuthProvider.PROVIDER_ID,
				firebase.auth.EmailAuthProvider.PROVIDER_ID,
				firebase.auth.PhoneAuthProvider.PROVIDER_ID,
				firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
			],
		};
		var ui = new firebaseui.auth.AuthUI(firebase.auth());
		ui.start("#firebaseui-auth-container", uiConfig);
	}
}



rh.DetailpageManager = class {
	constructor() {
		
		var settings = {
			"url": localStorage.getItem("url"),
			"method": "GET",
			"timeout": 0,
			"async": false
		};

		$.ajax(settings).done(function (response) {
			console.log(response);
			this.pm2 = response['data']['current']['pollution']['aqius'];
			this.pm10 = response['data']['current']['pollution']['aqicn'];
			this.windspeed = response['data']['current']['weather']['ws'];
			this.temp = response['data']['current']['weather']['tp'];
			this.weather = response['data']['current']['weather']['ic'];
			favoriteLAT = response['data']['location']['coordinates'][1];
			favoriteLNG = response['data']['location']['coordinates'][0];
			console.log(this.pm2);
			console.log(this.pm10);
			console.log(this.windspeed);
			console.log(this.temp);
			console.log(this.weather);
			console.log(favoriteLNG);
			console.log(favoriteLAT);
			$("#currentHourStat").html(this.pm2);
			$("#nextHourStat").html(this.pm2 + Math.round(Math.random() * 3));
			$("#monE1").html(this.pm2 + Math.round(Math.random() * 10));
			$("#monE2").html(this.pm10 + Math.round(Math.random() * 10));
			$("#monE3").html(this.temp + Math.round(Math.random() * 10));
			$("#tueE1").html(this.pm2 + Math.round(Math.random() * 10));
			$("#tueE2").html(this.pm10 + Math.round(Math.random() * 10));
			$("#tueE3").html(this.temp + Math.round(Math.random() * 5));
			$("#wedE1").html(this.pm2 + Math.round(Math.random() * 10));
			$("#wedE2").html(this.pm10 + Math.round(Math.random() * 10));
			$("#wedE3").html(this.temp + Math.round(Math.random() * 5));
			$("#thuE1").html(this.pm2 + Math.round(Math.random() * 10));
			$("#thuE2").html(this.pm10 + Math.round(Math.random() * 10));
			$("#thuE3").html(this.temp + Math.round(Math.random() * 5));
			$("#friE1").html(this.pm2 + Math.round(Math.random() * 10));
			$("#friE2").html(this.pm10 + Math.round(Math.random() * 10));
			$("#friE3").html(this.temp + Math.round(Math.random() * 5));
			$("#satE1").html(this.pm2 + Math.round(Math.random() * 10));
			$("#satE2").html(this.pm10 + Math.round(Math.random() * 10));
			$("#satE3").html(this.temp + Math.round(Math.random() * 5));
			$("#sunE1").html(this.pm2 + Math.round(Math.random() * 10));
			$("#sunE2").html(this.pm10 + Math.round(Math.random() * 10));
			$("#sunE3").html(this.temp + Math.round(Math.random() * 5));
			localStorage.setItem("lat", favoriteLAT);
			localStorage.setItem("lng", favoriteLNG);
			
		});

		$("#cityName").html(localStorage.getItem("name"));
		this.getAlert();
	}
	
	getAlert() {

		var settings = {
			"url": localStorage.getItem("url"),
			"method": "GET",
			"timeout": 0,
			"async": false
		};

		$.ajax(settings).done(function (response) {
			console.log(response);
			this.pm2 = response['data']['current']['pollution']['aqius'];
			this.pm10 = response['data']['current']['pollution']['aqicn'];
			this.temp = response['data']['current']['weather']['tp'];
		if(localStorage.getItem("element")==null){
			return;
		}
		if(localStorage.getItem("element").localeCompare("PM 2.5")&&this.pm2>localStorage.getItem("level")){

			alert("PM 2.5 is above alert level")
		}else
		if(localStorage.getItem("element").localeCompare("PM 10")&&this.pm10>localStorage.getItem("level")){

			alert("PM 10 is above alert level")
		}else
		if(localStorage.getItem("element").localeCompare("TEMPERTURE")&&this.temp>localStorage.getItem("level")){

			alert("Temperture is above alert level")
		}


	})}

}

rh.detailpageController = class {
	constructor() {
		$("#submit").click((event) => {
		
			const element = $("#alarmInput").val();
			const level = $("#dataInput").val();
			localStorage.setItem("element", element);
			localStorage.setItem("level",level);
			$("#alarmInput").val("Alert Element");
			$("#dataInput").val("Set your level for alert");

		})

		$("#backBtn").click((e) => {

			_ref1 = "https://aqic-2e4f4.firebaseapp.com/";
			window.location.href = _ref1;

		})

		$("#fab1").click((e) => {

			_ref1 = "https://aqic-2e4f4.firebaseapp.com/config.html";
			window.location.href = _ref1;
		})

		$("#Map").click((e) => {
			_ref1 = "https://aqic-2e4f4.firebaseapp.com/map.html";
			window.location.href = _ref1;
		})

		



		//weather icon selection

		if (weather == "01d") {
			//return;
		}
		if (weather == "01n") {
			//return;
		}
		if (weather == "02d") {
			//return;
		}
		if (weather == "02n") {
			//return;
		}
		if (weather == "03d") {
			//return;
		}
		if (weather == "09d") {
			//return;
		}
		if (weather == "10d") {
			//return;
		}
		if (weather == "10n") {
			//return;
		}
		if (weather == "11d") {
			//return;
		}
		if (weather == "13d") {
			//return;
		}
		if (weather == "50d") {
			//return;
		}
	}






};

/* Main */
$(document).ready(() => {
	console.log("Ready");
	//console.log(window.location.search);
	if ($("#mainpage").length) {
		console.log("On the mainpage");
		rh.mainpageManager = new rh.MainpageManager();
		new rh.mainpageController();
	}

	if ($("#config-page").length) {
		console.log("On the configpage");
		rh.configpageManager = new rh.ConfigpageManager();
		new rh.configpageController();


	}
	if ($("#map-page").length) {
		console.log("On the mappage");
		rh.mappageManager = new rh.MappageManager();
		new rh.mappageController();


	}

	if ($("#auth-page").length) {
		console.log("On the authpage");
		rh.authpageManager = new rh.AuthpageManager();
		new rh.authpageController();


	}

	if ($("#mainInfoContainer").length) {
		console.log("On detail page");

		//if (currentCity) {

		rh.detailpageManager = new rh.DetailpageManager();
		new rh.detailpageController();
		//	} else {
		//		console.log("Missing city");
		//		window.location.href = "/";
		//}
	}


});