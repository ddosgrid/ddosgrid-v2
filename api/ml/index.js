const { Router } = require('express')
const router = Router()
const { protect } = require('../auth/index')

router.get('/algorithms', protect, getAllAlgorithms)
router.get('/attacktypes', protect, getAllAttackTypes)


async function getAllAlgorithms(req, res) {
  var algorithms = [{
    name: 'Random Forest Classification',
    id: 'randomforest'
  },{
    name: 'K-Nearest Neighbor Classification',
    id: 'knn'
  }]
  return res.status(200).send(algorithms)
}

async function getAllAttackTypes(req, res) {
  var attackTypes = [{
    name: 'No Attack / Unknown',
    id: '0'
  },{
    name: 'TCP SYN-Flood',
    id: '1'
  },
  {
    name: 'ICMP-Flood',
    id: '2'
  },
  {
    name: 'UDP-Flood',
    id: '3'
  }]
  return res.status(200).send(attackTypes)
}

module.exports = router
