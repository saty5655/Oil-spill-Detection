Map.centerObject(roi);

var sen1 = ee.ImageCollection("COPERNICUS/S1_GRD")
  .select('VV')
  .filterDate('2018', '2019')
  .filterBounds(roi)
  .filter(ee.Filter.calendarRange(4, 4, 'month'))
  .filter(ee.Filter.calendarRange(1, 5, 'day_of_month'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('instrumentMode', 'IW')).mosaic();
print(sen1);
// print(sen1.aggregate_array('orbitProperties_pass'))

Map.addLayer(sen1.clip(roi), [], 'sen1', false)

print(
  ui.Chart.image.histogram(sen1,roi,50)
)

var despeckel = sen1.focalMean(100,'square','meters');

Map.addLayer(despeckel.clip(roi), [], 'sen_despeckel', false);

print(
  ui.Chart.image.histogram(despeckel,roi,60)
  )

var thr = despeckel.lt(-25

);

Map.addLayer(thr.clip(roi),[],'oil_spill',false);

var mask = thr.updateMask(thr);

Map.addLayer(mask.clip(roi),[],'mask',false)

var area = mask.multiply(ee.Image.pixelArea().divide(1e6));

var oil_spill_area = ee.Number(area.reduceRegion({
  reducer: ee.Reducer.sum(), geometry: roi, scale: 100
 }).values().get(0));

print(oil_spill_area)


var oil_spill_vector = mask.reduceToVectors({
  geometry: roi,
  scale: 100
});

Map.addLayer(oil_spill_vector);

Export.table.toDrive({
  collection: oil_spill_vector,
  description: 'oil_spill',
  fileFormat: 'SHP',
  folder: 'oil'
});


