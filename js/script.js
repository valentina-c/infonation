var debug = false; 
var countriesLimit = 50; 
var endpoint, rest;


init();


function init()
	{
	 //account for the fact that this needs to be seen from github as well...
	 if(window.location.search.indexOf('rest') > 0)
		{ endpoint = 'https://restcountries.eu/rest/v2/', rest = true; }
	 else
		{ endpoint = 'c_api/index.php/', rest = false; }
	 
	 
	 $('#country_keyword').on('focus', function(){$(this).select(); }); 
	 $('#submit_form').on('click', function(event)
										{
										 event.preventDefault(); 
										 
										 var k = ($('#country_keyword').val()).replace(/[^a-zA-Z]+/g, ''); 
										 if(k != '')
											{
											var linkend = endpoint; 
											if (rest) 
												{
												if(k.length == 2 || k.length == 3)
													{ linkend = endpoint + 'alpha/' + k; }
												else
													{ linkend = endpoint + 'name/' + k; }
												}
											else
												{ linkend = endpoint + k; }
											
											getData(linkend)
													.done(function(data)
																{
																if(data.error)
																	{
																	 if(debug){ console.log(data.error); } 
																	 else{ alert(data.message); }
																	}
																else
																	{
																	 $('#cards_container').empty();
																	 $('#counts_container').empty();
																	 $('#counts_countries').html('0');
																	 
																	 if(rest)
																		{
																		 //no php on github... do the logic here...
																		 if(!data.length)
																			{ data = [data]; }
																		 
																		 data = doProjectLogic(data); 
																		}
																	 
																	 displayData(data.countries); 
																	 displayCounts(data.counts);
																	}
																})
											}
										 else
											{ displayError('You are supposed to actually type something... '); }
										});
	}
	

	
	

function getData(address)
	{
	return $.ajax({ method: 'GET',
					url: address,
					dataType: 'json'})
				
				.fail(function(r)
							{
							if(r.status == 404)
								{
								 if(debug){ console.log(r.responseJSON.message); } 
								 else{ alert(r.responseJSON.message); }
								}
							});
	}



function displayData(data)
	{
	if(data.length && data.length > 0)
		{
		for(var i=0; i<data.length; i++)
			{ addCard(data[i]); }
		}
	else
		addCard(data);
	}


function addCard(info)
	{
	var languagesHtml = '';
	for(var i=0; i<info.languages.length; i++)
		{ languagesHtml += '<div class="country_language" title="' + info.languages[i].nativeName + '">' + info.languages[i].name + '</div>'; }
	
	var html = '<div class="card_container col-12 col-md-8 col-lg-4 col-xl-3">' + 
					'<div class="card">' + 
						'<div class="card-header">' + 
							'<div class="country_name">' + info.name + '</div>' + 
							'<div class="country_flag"><img src="'+ info.flag +'" style="80px" /></div>' + 
						'</div>' +  
						'<div class="card-body">' + 
							'<div class="country_region"><b>Region:</b> ' + info.region + '</div>' + 
							'<div class="country_region"><b>SubRegion:</b> ' + info.subregion + '</div>' + 
							'<div class="country_codes"><b>Codes:</b> ' + info.alpha2Code + ', ' + info.alpha3Code + '</div>' + 
							'<div class="country_languages">' + 
								'<div class="float-left" style="width: 37%;"><b>Languages:</b></div>' + 
								'<div class="float-left" style="width: 60%;">' + languagesHtml + '</div>' +
							'</div><br style="clear: both;" />' + 
							'<div class="country_population"><b>Population:</b> ' + info.population.toLocaleString() + '</div>' + 
							'<div class="country_capital"><b>Capital:</b> ' + info.capital + '</div>' + 
						'</div>' + 
						'<div class="card-footer"></div>' + 
					'</div>' + 
				'</div>'; 
	
	$('#cards_container').append(html); 
	}


function displayCounts(data)
	{
	 if(data.countriesNr)
		{
		$('#counts_countries').html(data.countriesNr);
		}
	 
	 if(data.regions)
		{
		var html = '	<div class="col-12 col-md-6">' + 
							'<ul class="list-group">' + 
								'<li class="list-group-item header">Regions</li>' + 
								'<div id="counts_regions">'; 
		for(var region in data.regions)
			{
			html += 				'<li class="list-group-item">' + 
										'<span>' + region + '</span>' +
										'<span class="badge badge-secondary float-right">' + data.regions[region] + '</span>' + 
									'</li>'; 
			}
		html += '				</div>' + 
							'</ul>' + 
						'</div>'+ 
						'<div class="col-12 col-md-6">' + 
							'<ul class="list-group">' + 
								'<li class="list-group-item header">Subregions</li>' + 
								'<div id="counts_subregions">'; 
		
		for(var subregion in data.subregions)
			{
			html += 				'<li class="list-group-item">' + 
										'<span>' + subregion + '</span>' +
										'<span class="badge badge-secondary float-right">' + data.subregions[subregion] + '</span>' + 
									'</li>'; 
			}
		html += '				</div>' + 
							'</ul>' + 
						'</div>'; 
		
		$('#counts_container').html(html);
		}
	}


function doProjectLogic(data)
	{
	 var out = {}; 
	 
	 //sort
	 data.sort(function(a, b)
					{
					 var nameComp = a.name.localeCompare(b.name); 
					 
					 if(nameComp == 0)						//compare population if name is same... I am not sure it is possible...
						{ return parseFloat(a.population) - parseFloat(b.population); }
					 else
						{ return nameComp; }
					});
	 //limit
	 data = data.slice(0, countriesLimit);
	 
	 out.countries = data;
	 
	 
	 //find and count regions and subregions
	 var dataInfo = { countriesNr: out.countries.length, regions: {}, subregions: {} };
	 for(var country in data)
		{
		 if(dataInfo.regions[data[country].region])
			{ dataInfo.regions[data[country].region] ++; }
		 else
			{ dataInfo.regions[data[country].region] = 1; }
		 
		 
		 if(dataInfo.subregions[data[country].subregion])
			{ dataInfo.subregions[data[country].subregion] ++; }
		 else
			{ dataInfo.subregions[data[country].subregion] = 1; }
		}
	 out.counts = dataInfo; 
	 
	 
	 return out;
	}


function displayError(msg)
	{
	if(debug)
		{ console.log(msg); }
	else
		{ alert(msg); }
	}
