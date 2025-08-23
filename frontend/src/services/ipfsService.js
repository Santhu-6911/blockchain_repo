import { create } from 'ipfs-http-client';
import { IPFS_CONFIG } from '../config/blockchain';

class IPFSService {
  constructor() {
    this.ipfs = null;
    this.init();
  }

  init() {
    try {
      this.ipfs = create(IPFS_CONFIG);
      console.log('IPFS initialized');
    } catch (error) {
      console.error('IPFS initialization failed:', error);
    }
  }

  // Upload data to IPFS
  async upload(data) {
    if (!this.ipfs) {
      throw new Error('IPFS not initialized');
    }

    try {
      const result = await this.ipfs.add(JSON.stringify(data));
      console.log('Uploaded to IPFS:', result.path);
      return result.path;
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw error;
    }
  }

  // Download data from IPFS
  async download(hash) {
    if (!this.ipfs) {
      throw new Error('IPFS not initialized');
    }

    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(hash)) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      console.error('IPFS download failed:', error);
      throw error;
    }
  }

  // Check if IPFS is available
  isAvailable() {
    return !!this.ipfs;
  }
}

export default new IPFSService();