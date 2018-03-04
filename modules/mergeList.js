function mergeList(lst1, lst2) {
  return lst1.map(o1 => Object.assign({comment: lst2.find(o2 => o2.county === o1.region).comment},
                                      {emergency: lst2.find(o2 => o2.county === o1.region).emergency},
                                      {opening_year: lst2.find(o2 => o2.county === o1.region).opening_year},
                                      {bed_count: lst2.find(o2 => o2.county === o1.region).bed_count}, o1));
}

module.exports = mergeList;
