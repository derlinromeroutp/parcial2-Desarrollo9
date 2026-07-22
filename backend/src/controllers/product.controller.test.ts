import { afterEach, describe, expect, mock, test } from 'bun:test';
import { deleteProduct, getProductsForComparison, getRelatedProducts } from './product.controller';
import { Product } from '../models/Product';

function createContext(id = 'prod_1') {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      param: () => id,
    },
    json: (value: unknown, status?: number) => {
      payload = value;
      statusCode = status ?? 200;
      return { payload: value, status: statusCode };
    },
  };

  return {
    context,
    get statusCode() {
      return statusCode;
    },
    get payload() {
      return payload;
    },
  };
}

function createQueryContext(query: Record<string, unknown>) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      valid: (_key: string) => query,
    },
    json: (value: unknown, status?: number) => {
      payload = value;
      statusCode = status ?? 200;
      return { payload: value, status: statusCode };
    },
  };

  return {
    context,
    get statusCode() {
      return statusCode;
    },
    get payload() {
      return payload;
    },
  };
}

function createParamAndQueryContext(id: string, query: Record<string, unknown>) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      param: () => id,
      valid: (_key: string) => query,
    },
    json: (value: unknown, status?: number) => {
      payload = value;
      statusCode = status ?? 200;
      return { payload: value, status: statusCode };
    },
  };

  return {
    context,
    get statusCode() {
      return statusCode;
    },
    get payload() {
      return payload;
    },
  };
}

afterEach(() => {
  mock.restore();
});

describe('deleteProduct controller', () => {
  test('returns deleted product data when the product exists', async () => {
    const deletedProduct = {
      _id: 'prod_1',
      name: 'iPhone 13 Reacondicionado',
      description: '128GB',
      price: 699,
      stock: 4,
      condition: 'A',
      category: 'celular',
      image_urls: ['https://cdn.test/iphone.jpg'],
    };

    const deleteById = mock(() => Promise.resolve(deletedProduct));
    Product.findByIdAndDelete = deleteById as typeof Product.findByIdAndDelete;

    const harness = createContext('prod_1');

    await deleteProduct(harness.context as never);

    expect(deleteById).toHaveBeenCalledWith('prod_1');
    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual({
      success: true,
      message: 'Producto eliminado correctamente',
      data: deletedProduct,
    });
  });

  test('returns 404 when the product does not exist', async () => {
    const deleteById = mock(() => Promise.resolve(null));
    Product.findByIdAndDelete = deleteById as typeof Product.findByIdAndDelete;

    const harness = createContext('missing_product');

    await deleteProduct(harness.context as never);

    expect(harness.statusCode).toBe(404);
    expect(harness.payload).toEqual({
      success: false,
      message: 'Producto no encontrado',
    });
  });
});

describe('getProductsForComparison controller', () => {
  test('queries by the deduplicated list of ids and returns the matches', async () => {
    const products = [
      { _id: '507f1f77bcf86cd799439011', name: 'iPhone 13' },
      { _id: '507f1f77bcf86cd799439012', name: 'Galaxy S22' },
    ];

    const find = mock(() => Promise.resolve(products));
    Product.find = find as unknown as typeof Product.find;

    const harness = createQueryContext({
      ids: '507f1f77bcf86cd799439011,507f1f77bcf86cd799439012,507f1f77bcf86cd799439011',
    });

    await getProductsForComparison(harness.context as never);

    expect(find).toHaveBeenCalledWith({
      _id: { $in: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] },
    });
    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual({ success: true, data: products });
  });

  test('returns a 500 when the lookup fails', async () => {
    const find = mock(() => Promise.reject(new Error('db down')));
    Product.find = find as unknown as typeof Product.find;

    const harness = createQueryContext({ ids: '507f1f77bcf86cd799439011,507f1f77bcf86cd799439012' });

    await getProductsForComparison(harness.context as never);

    expect(harness.statusCode).toBe(500);
    expect(harness.payload).toEqual({ success: false, message: 'db down' });
  });
});

function createLimitQuery(result: unknown) {
  return { limit: () => Promise.resolve(result) };
}

describe('getRelatedProducts controller', () => {
  const validId = '507f1f77bcf86cd799439011';

  test('returns a 400 for an invalid product id', async () => {
    const harness = createParamAndQueryContext('not-an-id', {});

    await getRelatedProducts(harness.context as never);

    expect(harness.statusCode).toBe(400);
    expect(harness.payload).toEqual({ success: false, message: 'ID de producto invalido' });
  });

  test('returns a 404 when the product does not exist', async () => {
    Product.findById = mock(() => Promise.resolve(null)) as typeof Product.findById;

    const harness = createParamAndQueryContext(validId, {});

    await getRelatedProducts(harness.context as never);

    expect(harness.statusCode).toBe(404);
    expect(harness.payload).toEqual({ success: false, message: 'Producto no encontrado' });
  });

  test('queries same-category products excluding the current one, applying the default limit', async () => {
    const product = { _id: validId, category: 'laptop' };
    const related = [{ _id: '507f1f77bcf86cd799439012', category: 'laptop' }];

    Product.findById = mock(() => Promise.resolve(product)) as typeof Product.findById;
    const find = mock(() => createLimitQuery(related));
    Product.find = find as unknown as typeof Product.find;

    const harness = createParamAndQueryContext(validId, {});

    await getRelatedProducts(harness.context as never);

    expect(find).toHaveBeenCalledWith({ _id: { $ne: validId }, category: 'laptop' });
    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual({ success: true, data: related });
  });

  test('honors a custom limit', async () => {
    const product = { _id: validId, category: 'laptop' };
    Product.findById = mock(() => Promise.resolve(product)) as typeof Product.findById;

    const limitSpy = mock(() => Promise.resolve([]));
    Product.find = mock(() => ({ limit: limitSpy })) as unknown as typeof Product.find;

    const harness = createParamAndQueryContext(validId, { limit: 8 });

    await getRelatedProducts(harness.context as never);

    expect(limitSpy).toHaveBeenCalledWith(8);
  });
});
