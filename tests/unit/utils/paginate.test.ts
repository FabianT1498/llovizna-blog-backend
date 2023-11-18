import * as paginateModule from '../../../src/utils/paginate';
import UserModel from '../../../src/models/user';

import * as db from './../../db';

// Que ocurre al usar jest.mock?:
//
// R: jest.mock() remplaza todas las funciones exportadas por el modulo
// por su versión mock, incluso si se utiliza jest.requireActual(), esta mantiene la implementación
// de las funciones exportadas, pero crea versiones mock de estas
// por lo tanto, si se desea, crear un mock de una función en especifico y mantener el resto de
// funciones reales, entonces se debe usar jest.spyOn. En este caso al usar spyOn sobre paginateData,
// esta remplaza esta función por un mock y se ve reflejada en la invocación a paginateData realizada por paginate. No
// obstante, si se utiliza jest.mock(), tanto paginate y paginateData serian mocks, por lo tanto paginate (Que mantiene su
// implementación original) estaría llamando a paginateData original.

// jest.mock('../../../src/utils/paginate', () => {
//   const originalModule = jest.requireActual('../../../src/utils/paginate');

//   //Mock the default export and named export 'foo'
//   return {
//     __esModule: true,
//     ...originalModule,
//     getPaginateData: jest.fn(() => {
//       console.log('Hola mundo');
//       return Promise.resolve({
//         results: [],
//         total: 0,
//         totalPages: 0,
//         currentPage: 1,
//       });
//     }),
//   };
// });

jest.spyOn(paginateModule, 'getPaginateData').mockImplementation(() => {
  return Promise.resolve({
    results: [],
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });
});

beforeAll(async () => await db.connect());

afterEach(async () => await db.clearDatabase());

afterAll(async () => await db.closeDatabase());

describe('paginate function', () => {
  it('should return an empty results', async () => {
    const query = UserModel.find();
    const page = '1';
    const pageSize = '10';

    const result = await paginateModule.paginate(query, page, pageSize);

    expect(paginateModule.getPaginateData).toHaveBeenCalledTimes(1);

    expect(result).toBeDefined();
    expect(result.total).toEqual(0);
  });
});
