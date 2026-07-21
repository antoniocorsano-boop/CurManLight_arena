// Micro-Zip Generator Nativo per l'esportazione SCORM d'Istituto (Fase A)
export class LocalZipPacker {
 private files: Array<{ name: string; content: Uint8Array }> = [];

 public addFile(name: string, content: string) {
  const encoder = new TextEncoder();
  this.files.push({ name, content: encoder.encode(content) });
 }

 public exportZip(): Blob {
  let offset = 0;
  const parts: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];

  this.files.forEach(f => {
   const nameBytes = new TextEncoder().encode(f.name);
   
   // Local File Header (RFC 1952 standard)
   const lfh = new Uint8Array(30 + nameBytes.length);
   const view = new DataView(lfh.buffer);
   view.setUint32(0, 0x04034b50, true); // ZIP Signature
   view.setUint16(4, 10, true);     // Version needed
   view.setUint16(8, 0, true);     // Compression method (Store = 0)
   view.setUint32(18, f.content.length, true); // Compressed size
   view.setUint32(22, f.content.length, true); // Uncompressed size
   view.setUint16(26, nameBytes.length, true); // Filename length
   lfh.set(nameBytes, 30);

   parts.push(lfh);
   parts.push(f.content);

   // Central Directory File Header
   const cdfh = new Uint8Array(46 + nameBytes.length);
   const cdView = new DataView(cdfh.buffer);
   cdView.setUint32(0, 0x02014b50, true); // CD Signature
   cdView.setUint16(6, 10, true);     // Version needed
   cdView.setUint32(20, f.content.length, true); // Compressed size
   cdView.setUint32(24, f.content.length, true); // Uncompressed size
   cdView.setUint16(28, nameBytes.length, true); // Filename length
   cdView.setUint32(42, offset, true);      // Local header offset
   cdfh.set(nameBytes, 46);
   centralDirectory.push(cdfh);

   offset += lfh.length + f.content.length;
  });

  // End of Central Directory
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // EOCD Signature
  eocdView.setUint16(8, this.files.length, true); // Number of records
  eocdView.setUint16(10, this.files.length, true); // Total records
  
  let cdSize = 0;
  centralDirectory.forEach(c => cdSize += c.length);
  eocdView.setUint32(12, cdSize, true); // Size of Central Directory
  eocdView.setUint32(16, offset, true); // Offset of start of CD

  const blobParts = [...parts, ...centralDirectory, eocd] as BlobPart[];
  return new Blob(blobParts, { type: 'application/zip' });
 }
}


