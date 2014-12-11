
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


function kreirajEHRzaBolnika() {
	sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var datumRojstva = $("#kreirajDatumRojstva").val();

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#kreirajSporocilo").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    $("#preberiEHRid").val(ehrId);
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}


function preberiEHRodBolnika() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#preberiSporocilo").html("<span class='obvestilo label label-success fade-in'>Prebivalec '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.</span>");
				console.log("Prebivalec '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.");
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}	
}


function dodajMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = $("#dodajVitalnoEHR").val();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();
	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();
	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
	var sistolicniKrvniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
	var diastolicniKrvniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
	var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();
	var merilec = $("#dodajVitalnoMerilec").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom,
		};
		var parametriZahteve = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: merilec
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	console.log(res.meta.href);
		        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	}
}
function generator(){
	$("#dodajVitalnoDatumInUra").val(stevilka(1994, 2014) +"-"+ stevilka2(1,12)+"-"+stevilka2(1,28)+"T"+stevilka2(0,24)+":"+stevilka2(0,59));
	$("#dodajVitalnoTelesnaVisina").val(stevilka(130, 215));
	$("#dodajVitalnoTelesnaTeza").val(stevilka(40,180));
	$("#dodajVitalnoKrvniTlakSistolicni").val(stevilka(50, 220));
	$("#dodajVitalnoKrvniTlakDiastolicni").val(stevilka(40, 120));
	$("#dodajVitalnoMerilec").val('Marija');
}

function stevilka(min, max){
	var st= Math.floor(Math.random()* (max - min + 1)) + min;
	return st;
}

function stevilka2(min, max){
	var st= Math.floor(Math.random()* (max - min + 1)) + min;
	if (st < 10){
		st+= "0";
	}
	return st;
}


function preberiMeritveVitalnihZnakov() {
	sessionId = getSessionId();	

	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
			var AQL =	"select " +
					        "a_a/data[at0002]/events[at0003]/time/value as cas, " +
					        "a_b/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude as tlak_d, " +                                         
					        "a_b/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude as tlak_s, " +
					        "a_c/data[at0001]/events[at0002]/data[at0003]/items[at0004]/value/magnitude as visina, " +
					        "a_d/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as teza " +
						"from EHR e[ehr_id/value='"+ehrId+"']" +
						"contains COMPOSITION a " +
						"contains ( " +
						        "OBSERVATION a_d[openEHR-EHR-OBSERVATION.body_weight.v1] and " +
						        "OBSERVATION a_c[openEHR-EHR-OBSERVATION.height.v1] and " +
						        "OBSERVATION a_a[openEHR-EHR-OBSERVATION.body_temperature.v1] and " +
						        "OBSERVATION a_b[openEHR-EHR-OBSERVATION.blood_pressure.v1]) " +               
						"offset 0 limit 4";
			$.ajax({
					    url: baseUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th></tr>";
					    	if (res) {
					    		var rows = res.resultSet;
						        for (var i in rows) {
						            //results += "<tr><td class='klikablien-datum'>" + rows[i].cas + "</td>";
						            results += "<tr><td><button type='button' class='klikabilen' value='"+rows[i].cas+"'>"+ rows[i].cas +"</button></td></tr>"
						            
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
						        
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}

					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
		
} 
function preberiMeritveVitalnihZnakov2(a){
		sessionId = getSessionId();	
	console.log(a);
	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
			var AQL =	"select " +
					        "a_a/data[at0002]/events[at0003]/time/value as cas, " +
					        "a_b/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude as tlak_d, " +                                         
					        "a_b/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude as tlak_s, " +
					        "a_c/data[at0001]/events[at0002]/data[at0003]/items[at0004]/value/magnitude as visina, " +
					        "a_d/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as teza " +
						"from EHR e[ehr_id/value='"+ehrId+"']" +
						"contains COMPOSITION a " +
						"contains ( " +
						        "OBSERVATION a_d[openEHR-EHR-OBSERVATION.body_weight.v1] and " +
						        "OBSERVATION a_c[openEHR-EHR-OBSERVATION.height.v1] and " +
						        "OBSERVATION a_a[openEHR-EHR-OBSERVATION.body_temperature.v1] and " +
						        "OBSERVATION a_b[openEHR-EHR-OBSERVATION.blood_pressure.v1]) " +               
						"offset 0 limit 4";
			$.ajax({
					    url: baseUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th></tr>";
					    	if (res) {
					    		var rows = res.resultSet;
						        for (var i in rows) {
						            if (rows[i].cas == a){
						            var visina = rows[i].visina;
						            var teza = rows[i].teza;
						            var tlak_s = rows[i].tlak_s;
						            var tlak_d = rows[i].tlak_d;
						            var bmi = rows[i].teza /((rows[i].visina/100)*(rows[i].visina/100));
						            var tlakS = rows[i].tlak_s+rows[i].tlak_d;
						            
						           	var x=79;
						           	var y;
						           	var z;
						           	if (String(bmi).substring(0,2) >15 && String(bmi).substring(0,2)<25){
						           		x=79;
						           	} else {
						           		
						           	}
						            	
						            }
						            
						            
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
						        
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}

					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
		
} 


$(document).ready(function() {
	$('#preberiObstojeciEHR').change(function() {
		$("#preberiSporocilo").html("");
		$("#preberiEHRid").val($(this).val());
		zunanji_vir1();
	});
	$('#preberiPredlogoBolnika').change(function() {
		$("#kreirajSporocilo").html("");
		var podatki = $(this).val().split(",");
		$("#kreirajIme").val(podatki[0]);
		$("#kreirajPriimek").val(podatki[1]);
		$("#kreirajDatumRojstva").val(podatki[2]);
	});
	$('#preberiObstojeciVitalniZnak').change(function() {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("");
		var podatki = $(this).val().split("|");
		$("#dodajVitalnoEHR").val(podatki[0]);
		$("#dodajVitalnoDatumInUra").val(podatki[1]);
		$("#dodajVitalnoTelesnaVisina").val(podatki[2]);
		$("#dodajVitalnoTelesnaTeza").val(podatki[3]);
		$("#dodajVitalnoTelesnaTemperatura").val(podatki[4]);
		$("#dodajVitalnoKrvniTlakSistolicni").val(podatki[5]);
		$("#dodajVitalnoKrvniTlakDiastolicni").val(podatki[6]);
		$("#dodajVitalnoNasicenostKrviSKisikom").val(podatki[7]);
		$("#dodajIndeksTelesneMase").val(podatki[8]);
		$("#dodajVitalnoMerilec").val(podatki[9]);
	});
	$('#preberiEhrIdZaVitalneZnake').change(function() {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});
	
	$('#klikabilen').change(function() {
	    alert($(this).html());
	});

});

//*[@id="tabele"]/table[1]/tbody/tr/td/div[2]/table/tbody/tr[14]/td[6]/b zenske
//*[@id="tabele"]/table[1]/tbody/tr/td/div[2]/table/tbody/tr[15]/td[6]/b moski
//#tabele > table:nth-child(1) > tbody > tr > td > div:nth-child(2) > table > tbody > tr:nth-child(15) > td:nth-child(6) > b css moski
//#tabele > table:nth-child(1) > tbody > tr > td > div:nth-child(2) > table > tbody > tr:nth-child(14) > td:nth-child(6) > b css zenske
//http://www.stat.si/novica_prikazi.aspx?id=4815



function zunanji_vir1(){
	var a;
	a = 'select * from html where url="http://www.stat.si/novica_prikazi.aspx?id=4815" and compat="html5" and xpath="*//td/b"'; //mi najde vse vrednosti treba sam 12, 13
	console.log(a);
}

