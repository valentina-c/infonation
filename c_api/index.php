<?php
header("Content-Type: application/json; charset=UTF-8");

$endpoint_countries = 'https://restcountries.eu/rest/v2/'; 
$countriesLimit = 50;



if(isset($_SERVER['PATH_INFO']))
	{
	 $keyword = trim(preg_replace('/[^a-zA-Z]+/', '', $_SERVER['PATH_INFO']));
	 if(!empty($keyword))
		{
		 //I have to come up with a better logic here.....
		 if(strlen($keyword) == 2 || strlen($keyword) == 3)
			{ $ad = $endpoint_countries . 'alpha/' . $keyword; }
		 else
			{ $ad = $endpoint_countries . 'name/' . $keyword; }
		 
		 
		 if(!$json = @file_get_contents($ad))
			{
			 $error = error_get_last();
			 echo json_encode(['message' => 'The country name you provided does not exist in the data store.', 'error' => $error['message']]);
			}
		 else
			{
			 $data = json_decode($json);
			 if(is_array($data))
				{
				 if(count($data) > 0)
					{
					usort($data, 'compareCountries'); 
					$data = array_slice($data, 0, $countriesLimit); 
					}
				}
			 else
				{ $data = [$data]; }
			 
			 
			 $counts = countItems($data);
			 
			 
			 echo json_encode(['countries' => $data, 'counts' => $counts]); 
			}
		}
	}
else
	{
	 echo json_encode(['message' => 'Please provide a country name or alpha code. ', 'error' => 'Please provide a country name or alpha code. ']); 
	}


function compareCountries($c1, $c2)
	{
	if($c1->name == $c2->name)
		{
		if($c1->population == $c2->population)
			{ return 0; }
		return ($c1->population > $c2->population) ? 1 : -1;
		}
	else
		{
		return strcmp($c1->name, $c2->name); 
		}
	}

function countItems($data)
	{
	$dataInfo = ['countries' => count($data), 'regions' => [], 'subregions' => []]; 
	foreach($data as $country)
		{
		if(isset($dataInfo['regions'][$country->region]))
			{ $dataInfo['regions'][$country->region] ++; }
		else
			{ $dataInfo['regions'][$country->region] = 1; }
		
		if(isset($dataInfo['subregions'][$country->subregion]))
			{ $dataInfo['subregions'][$country->subregion] ++; }
		else
			{ $dataInfo['subregions'][$country->subregion] = 1; }
		}
	 return $dataInfo;
	}
