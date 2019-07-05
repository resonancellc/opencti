import { queryMultiple, updateAttribute } from '../src/database/grakn';
import { index } from '../src/database/elasticSearch';
import { logger } from '../src/config/conf';

module.exports.up = async next => {
  const resultPromise = Promise.all(
    ['observable'].map(async entityType => {
      const query = `match $x isa entity; $x has stix_id $sid; $sid contains "${entityType}"; get $x;`;
      const entities = await queryMultiple(query, ['x']);
      logger.info('Entities loaded');
      const updatePromise = Promise.all(
        entities.map(entity => {
          return updateAttribute(entity.x.id, {
            key: 'stix_id',
            value: [entity.x.stix_id.replace(entityType, 'indicator')]
          }).then(stixDomainEntity => {
            index('stix-observables', 'stix_observable', stixDomainEntity);
          });
        })
      );
      await Promise.resolve(updatePromise).then(() => {
        logger.info('Entities updated');
        return Promise.resolve(true);
      });
    })
  );
  await Promise.resolve(resultPromise).then(() => {
    logger.info('Migration complete');
  });
  next();
};

module.exports.down = async next => {
  next();
};
