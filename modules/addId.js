//Add id to each object in array for routing purposes
function addId(arr) {
  return arr.map(function(obj, index) {
  return Object.assign({}, obj, { id: index });
  });
};

module.exports = addId;
