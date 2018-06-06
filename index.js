'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const Rx = require('rx');
const AdmZip = require('adm-zip');
const path = require('path');

const allowedExtensions = ['.tiff', '.tif', '.nc', '.netcdf', '.dsfu'];

const sanitizeName = (basePath, entryName) => {
  const re = /[A-Za-z]+(\d+)(_\w+){0,1}\.(.*)/gi;
  const parts = re.exec(entryName);
  const outputPath = basePath.replace('backfill', path.join('low-priority-trace-sets', ''));
  const subFolder = parts[2] && parts[2].includes('_archived') ? 'archive' : 'telemetered';
  const suffix = parts[2] && parts[2].includes('_error') ? '_error' : '';
  const extension = parts[3];
  return path.join(outputPath, subFolder, `${parts[1]}${suffix}.${extension}`);
};

exports.sanitizeName = sanitizeName;

exports.handler = (event, context, callback) => {
  let file_key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  let bucket = event.Records[0].s3.bucket.name;
  let params = { Bucket: bucket, Key: file_key };
  let basePath = path.dirname(file_key);

  if (!basePath.includes('backfill')) {
    callback(null, 'file not applicable');
    return;
  }

  console.log('bucket: ' + bucket + ' key: ' + file_key)
  s3.getObject(params, (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      if (!data) callback(null, 'No Data!');
      let zip = new AdmZip(data.Body);
      let zipEntries = zip.getEntries(); // ZipEntry objects
      let source = Rx.Observable.from(zipEntries);
      let results = [];

      source.subscribe(
        (zipEntry) => {
          const extension = zipEntry.name.match(/(\..*)/);
          if (!allowedExtensions.includes(extension.toLowerCase())) {
            return;
          }
          let destinationPath = sanitizeName(basePath, zipEntry.name);
          let params = {
            Bucket: bucket,
            Key: destinationPath,
            Body: zipEntry.getCompressedData() // decompressed file as buffer
          };
          // upload decompressed file
          s3.putObject(params, (err, data) => {
            if (err) console.log(err, err.stack); // an error occurred
            else results.push(data);           // successful response
          });
        },
        (err) => {
          callback(err, null);
        }
      );
    }
  });
};
