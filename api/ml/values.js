const algorithms = [{
  name: 'Random Forest Classification',
  id: 'randomforest'
},{
  name: 'K-Nearest Neighbor Classification',
  id: 'knn'
}]

const attackTypes = [{
  name: 'No Attack',
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
},
{
  name: 'IP-Sweep',
  id: '4'
},
{
  name: 'Ping of Death',
  id: '5'
},
{
  name: 'Portsweep',
  id: '6'
}]

module.exports = { algorithms, attackTypes } 
