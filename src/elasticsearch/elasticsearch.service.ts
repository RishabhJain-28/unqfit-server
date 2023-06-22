import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService extends Client {
  constructor(config: ConfigService) {
    super({
      node: config.get('ELASTIC_URL'),
      //! secure  elastic search
      //   tls: {
      //     ca: ,
      //     rejectUnauthorized: false,
      //   },
      //   auth: {
      //     username: config.get('ELASTIC_USERNAME'),
      //     password: config.get('ELASTIC_PASSWORD'),
      //   },
    });
  }

  async createIndex(indexName: string) {
    await this.indices.create({ index: indexName, settings: {} });
    console.log('Index created');
  }

  async add(indexName: string, title: string, content: string) {
    console.log('adding');
    const result = await this.index({
      index: indexName,
      document: {
        title: title,
        author: 'test author',
        content,
      },
    });
    return result;
  }
}
