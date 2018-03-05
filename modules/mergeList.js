function mergeList(lst1, lst2) {
  for(var i = 0; i < lst1.length; i++) {
    if(lst1[i].name === lst2[i].name){
      return lst1.map(o1 => Object.assign({comment: lst2[i].find(o2 => o2.name == o1.name).comment},
                                          {emergency: lst2[i].find(o2 => o2.name == o1.name).emergency},
                                          {opening_year: lst2[i].find(o2 => o2.name == o1.name).opening_year},
                                          {bed_count: lst2[i].find(o2 => o2.name == o1.name).bed_count}, o1));
    };
  }
}

/*list1 = [{ id: 99,
  x: 'http://example.org/hospital/Basildon University Hospital',
  name: 'St Peter\'s Hospital (Chertsey)',
  city: 'St Peter\'s Hospital (Chertsey)',
  county: 'Essex',
  email: 'pals@btuh.nhs.uk',
  phone: '01268 524900',
  lat: '51.557685852050781',
  long: '0.45057165622711182',
  address: 'Nethermayne'},
   { id: 98,
  x: 'http://example.org/hospital/Barton Under Needwood Cottage Hospital',
  name: 'St Thomas\' Hospital',
  city: 'Burton-On-Trent',
  county: 'Staffordshire',
  email: '',
  phone: '',
  lat: '52.761592864990234',
  long: '-1.7252597808837891',
  address: 'Short Lane'}];

list2 = [ { x: 'http://dbpedia.org/resource/St_Peter\'s_Hospital_(Chertsey)',
  openingY: '1945',
  emergency: 'Yes',
  lat: '51.3772',
  long: '-0.526389',
  name: 'St Peter\'s Hospital (Chertsey)' },
  { x: 'http://dbpedia.org/resource/St_Thomas\'_Hospital',
  openingY: '1100',
  emergency: 'Yes',
  lat: '51.4991',
  long: '-0.11891',
  name: 'St Thomas\' Hospital' }];*/

//mergeList(list1, list2);

module.exports = mergeList;
