const { Sequelize } = require('sequelize');
const s = new Sequelize('postgresql://postgres:Bhaumik%401910@127.0.0.1:5432/enterprise_tms', { logging: false });

async function run() {
  await s.query(`UPDATE vehicles SET "currentLatitude" = 21.1702, "currentLongitude" = 72.8311, "currentSpeed" = 48, status = 'IN_TRANSIT' WHERE "vehicleNumber" = 'GSJFG';`);
  await s.query(`UPDATE vehicles SET "currentLatitude" = 22.5645, "currentLongitude" = 72.9289, "currentSpeed" = 62, status = 'IN_TRANSIT' WHERE "vehicleNumber" = 'GJ-01-AB-1122';`);
  await s.query(`UPDATE vehicles SET "currentLatitude" = 22.9221, "currentLongitude" = 72.5855, "currentSpeed" = 0, status = 'AVAILABLE' WHERE "vehicleNumber" = 'GJ-01-AC-3444';`);
  await s.query(`UPDATE vehicles SET "currentLatitude" = 18.9894, "currentLongitude" = 73.1175, "currentSpeed" = 58, status = 'IN_TRANSIT' WHERE "vehicleNumber" = 'MH-14-DX-9000';`);
  await s.query(`UPDATE vehicles SET "currentLatitude" = 27.7025, "currentLongitude" = 76.1963, "currentSpeed" = 65, status = 'IN_TRANSIT' WHERE "vehicleNumber" = 'RJ-13-TR-7788';`);
  await s.query(`UPDATE geofences SET name = 'Ahmedabad Aslali Freight Hub', "centerLatitude" = 22.9221, "centerLongitude" = 72.5855, "radiusMeters" = 1500 WHERE id = 'cd020edc-cbb6-478c-ba31-ef4f7be1b5ee';`);
  await s.query(`UPDATE geofences SET name = 'Mumbai Nhava Sheva Port Zone', "centerLatitude" = 18.9498, "centerLongitude" = 72.9515, "radiusMeters" = 2000 WHERE id = 'e2be5a95-39e6-4264-a349-e15d40030b23';`);
  console.log('Indian highway telemetry and geofences updated successfully!');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
