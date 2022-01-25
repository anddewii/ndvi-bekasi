Map.setCenter(106.99, -6.24, 10);

//add shp
var shp_bekasi = ee.FeatureCollection(shp)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////CLOUD MASK//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// cloudmask for Landsat 8 SR
function maskL8sr(image) {
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  // Get the pixel QA band.
  var qa = image.select('pixel_qa');
  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}


// Cloud mask for Landsat 7 SR
var MaskL7 = function(image) {
  var qa = image.select('pixel_qa');
  // If the cloud bit (5) is set and the cloud confidence (7) is high
  // or the cloud shadow bit is set (3), then it's a bad pixel.
  var cloud = qa.bitwiseAnd(1 << 5)
                  .and(qa.bitwiseAnd(1 << 7))
                  .or(qa.bitwiseAnd(1 << 3));
  // Remove edge pixels that don't occur in all bands
  var mask2 = image.mask().reduce(ee.Reducer.min());
  return image.updateMask(cloud.not()).updateMask(mask2);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////ADD CITRA//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////Citra Landsat SR 2020////////////////////
var srdata_20 = ee.ImageCollection(L7sr)
                  .filterBounds(shp)
                  .filterDate('2020-06-01', '2020-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 10)
                  .filterMetadata('CLOUD_COVER_LAND', 'less_than', 10)
                 
print(srdata_20);

var sr08 = ee.Image('LANDSAT/LC08/C01/T1_SR/LC08_122064_20200727')
            .clip(shp);

var sr_20 = ee.ImageCollection(sr08) 
.map(maskL8sr)
.mean()
.clip(shp);


var visualization = {
  min: 0.0,
  max: 30000.0,
  bands: ['B4', 'B3', 'B2'],
};

/////////////////////////Citra Landsat SR 2015//////////////////////////////
var srdata_15 = ee.ImageCollection(L7sr)
                  .filterBounds(shp)
                  .filterDate('2015-06-01', '2015-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 10)
                  .filterMetadata('CLOUD_COVER_LAND', 'less_than', 10)
                 
print(srdata_15);

var sr08_15 = ee.Image('LANDSAT/LC08/C01/T1_SR/LC08_122064_20150831')
            .clip(shp);

var sr_15 = ee.ImageCollection(sr08_15)   
.map(maskL8sr)
.mean()
.clip(shp);

///////////////////////////Add Map citra landsat 7////////////////////
//Map.addLayer(sr_20, visualization, 'SR 2020');
//Map.addLayer(sr_15, visualization, 'SR 2015');

/////////////////////////Citra Landsat 7 2010///////////////////////////
var l7data_10 = ee.ImageCollection(L8SR1)
                  .filterBounds(shp)
                  .filterDate('2010-06-01', '2010-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 50)
                  
print(l7data_10);   

var l7sr_10 = ee.Image('LANDSAT/LE07/C01/T1_SR/LE07_122064_20100521')
            .clip(shp);
        

var l7_10 = ee.ImageCollection(l7sr_10) 
.map(MaskL7)
.mean()
.clip(shp);


var l710_fill = l7_10.focal_mean(1, 'square', 'pixels', 30)

var l710_final = l710_fill.blend(l7_10)

///Map.addLayer(img_fill.clip(shp), visualization, 'Image Fill')
//Map.addLayer(l710_final.clip(shp), visualization, 'Final Image')

/////////////////////////Citra Landsat 7 2005///////////////////////////
var l7data_05 = ee.ImageCollection(L8SR1)
                  .filterBounds(shp)
                  .filterDate('2005-06-01', '2005-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 30)
                  
print(l7data_05, '2005');   
var l7sr_05 = ee.Image('LANDSAT/LE07/C01/T1_SR/LE07_122064_20050710')
            .clip(shp);
        

var l7_05 = ee.ImageCollection(l7sr_05)  
.map(MaskL7)
.mean()
.clip(shp);


var l705_fill = l7_05.focal_mean(1, 'square', 'pixels', 30)

var l705_final = l705_fill.blend(l7_05)

//Map.addLayer(img_fill05.clip(shp), visualization, 'Image Fill')
//Map.addLayer(l705_final.clip(shp), visualization, 'Final Image05')

///////////////////////////Citra Landsat 7 2000///////////////////////////////
var l7data_00 = ee.ImageCollection(L8SR1)
                  .filterBounds(shp)
                  .filterDate('2000-06-01', '2000-09-30')
                  .filterMetadata('CLOUD_COVER', 'less_than', 30)
                  
print(l7data_00, '2000'); 

var l7sr_00 = ee.Image('LANDSAT/LE07/C01/T1_SR/LE07_122064_20000914')
            .clip(shp);
        

var l7_00 = ee.ImageCollection(l7sr_00)   
.map(MaskL7)
.mean()
.clip(shp);


var l700_fill = l7_00.focal_mean(1, 'square', 'pixels', 30)

var l700_final = l700_fill.blend(l7_00)

//Map.addLayer(img_fill05.clip(shp), visualization, 'Image Fill')
//Map.addLayer(l700_final.clip(shp), visualization, 'Final Image00')


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////NDVI 2020//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Compute the Normalized Difference Vegetation Index (NDVI)
//2020
var ndvi20 = sr_20.normalizedDifference(['B5', 'B4']).rename('NDVI20');

//min max 
{
var min_20 = ee.Number(ndvi20.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(min_20, 'min_2020');

var max_20 = ee.Number(ndvi20.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(max_20, 'max_2020')
}

// Display the result.
var ndviParams = {min: -0.5187032418952618, max: 0.9045226130653267, palette: ['white', 'limegreen']};
Map.addLayer(ndvi20, ndviParams, 'NDVI_2020');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////NDVI 2015//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ndvi15 = sr_15.normalizedDifference(['B5', 'B4']).rename('NDVI15');

//min max 
{
var min_15 = ee.Number(ndvi15.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(min_15, 'min_2015');

var max_15 = ee.Number(ndvi15.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(max_15, 'max_2015')
}

// Display the result.
var ndviParams15 = {min: -0.35170178282009723, max: 0.8601052305787682, palette: ['white', 'limegreen']};
Map.addLayer(ndvi15, ndviParams15, 'NDVI_2015');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////NDVI 2010//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ndvi10 = l710_final.normalizedDifference(['B4', 'B3']).rename('NDVI10');

//min max 
{
var min_10 = ee.Number(ndvi10.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(min_10, 'min_2010');

var max_10 = ee.Number(ndvi10.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(max_10, 'max_2010')
}

// Display the result.
var ndviParams10 = {min: -0.17766116941529236, max: 0.8335195530726257, palette: ['white', 'limegreen']};
Map.addLayer(ndvi10.clip(shp), ndviParams10, 'NDVI_2010');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////NDVI 2005//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ndvi05 = l705_final.normalizedDifference(['B4', 'B3']).rename('NDVI05');

//min max 
{
var min_05 = ee.Number(ndvi05.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(min_05, 'min_2005');

var max_05 = ee.Number(ndvi05.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(max_05, 'max_2005')
}

// Display the result.
var ndviParams05 = {min: -0.2849256900212314, max: 0.8573878951237441, palette: ['white', 'limegreen']};
Map.addLayer(ndvi05.clip(shp), ndviParams05, 'NDVI_2005');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////NDVI 2000//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ndvi00 = l700_final.normalizedDifference(['B4', 'B3']).rename('NDVI00');

//min max 
{
var min_00 = ee.Number(ndvi00.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(min_00, 'min_2000');

var max_00 = ee.Number(ndvi00.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(max_00, 'max_2000')
}

// Display the result.
var ndviParams00 = {min: -0.5417823003391921, max: 0.7459594809924881, palette: ['white', 'limegreen']};
Map.addLayer(ndvi00.clip(shp), ndviParams00, 'NDVI_2000');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////EXPORT IMAGE//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Export.image.toDrive({
  image: ndvi10,
  description: 'NDVIBEKASI_10_UC_NEW',
  scale: 30,
  crs: 'EPSG:32748', // wgs 1984 48s
  region: shp
});
