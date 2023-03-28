const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags  
  try {
    const tags = await Tag.findAll({
      include: [
        {
          model: Product,
          through: ProductTag,
          as: 'products'
        }]
    });

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          through: ProductTag,
          as: 'products'
        }]
    });

    res.json(tag);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
 
      Tag.create(req.body)
      .then((tag) => {
        if (req.body.productIds && req.body.productIds.length) {
          const productTagIdArr = req.body.productIds.map((product_id) => {
            return {
              product_id,
              tag_id: tag.id
            };
          });
          return ProductTag.bulkCreate(productTagIdArr)
            .then(() => res.status(200).json(tag))
            .catch((err) => {
              console.log(err);
              res.status(400).json(err);
            });
        } else {
          res.status(200).json(product);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
});

router.put('/:id', (req, res) => {
  // update tag data
  Tag.update({ tag_name: req.body.tag_name }, {
    where: {
      id: req.params.id,
    },
  })
    .then(() => {
      
      return ProductTag.findAll({ where: { tag_id: req.params.id } });
    })
    .then((productTags) => {
      
      const productIds = productTags.map(({ product_id }) => product_id);
     
      const newProductIds = req.body.productIds
        .filter((product_id) => !productIds.includes(product_id))
        .map((product_id) => {
          return {
            product_id,
            tag_id: req.params.id,
          };
        });
      const productTagsToRemove = productTags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductIds),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  Tag.destroy({
    where: {
      id: req.params.id
    }
  })
  .then (() => {
    console.log('Item has been deleted from Categories')
    res.status(204);
  })
  .catch (err => {
    console.error(err)
    res.status(500).json(err)
  });
});

module.exports = router;