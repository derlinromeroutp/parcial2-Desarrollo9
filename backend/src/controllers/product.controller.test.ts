import { afterEach, describe, expect, mock, test } from 'bun:test';
import {
  createProduct,
  deleteProduct,
  getProductsForComparison,
  getRecentProducts,
  getRelatedProducts,
  updateProduct,
} from './product.controller';
import { Product } from '../models/Product';
import { AuditLog } from '../models/AuditLog';

function mockAuditLog() {
  const create = mock(() => Promise.resolve({ _id: 'log_1' }));
  AuditLog.create = create as unknown as typeof AuditLog.create;
  return create;
}

function createContext(id = 'prod_1', userId?: string) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      param: () => id,
    },
    get: (key: string) => (key === 'userId' ? userId : undefined),
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

function createParamAndQueryContext(id: string, query: Record<string, unknown>, userId?: string) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      param: () => id,
      valid: (_key: string) => query,
    },
    get: (key: string) => (key === 'userId' ? userId : undefined),
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

function createJsonContext(json: Record<string, unknown>, userId?: string) {
  let statusCode = 200;
  let payload: unknown;

  const context = {
    req: {
      valid: (_key: string) => json,
    },
    get: (key: string) => (key === 'userId' ? userId : undefined),
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
  test('returns deleted product data and records an audit log when the product exists', async () => {
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
    const auditCreate = mockAuditLog();

    const harness = createContext('prod_1', 'admin_1');

    await deleteProduct(harness.context as never);

    expect(deleteById).toHaveBeenCalledWith('prod_1');
    expect(auditCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'admin_1',
      action: 'product.delete',
      resourceType: 'Product',
      resourceId: 'prod_1',
    }));
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

function createSortLimitQuery(result: unknown) {
  const limitSpy = mock(() => Promise.resolve(result));
  const sortSpy = mock(() => ({ limit: limitSpy }));
  return { sortSpy, limitSpy, query: { sort: sortSpy } };
}

describe('getRecentProducts controller', () => {
  test('sorts by createdAt descending and applies the default limit', async () => {
    const products = [{ _id: '1', createdAt: '2026-02-01' }, { _id: '2', createdAt: '2026-01-01' }];
    const { sortSpy, limitSpy, query } = createSortLimitQuery(products);
    Product.find = mock(() => query) as unknown as typeof Product.find;

    const harness = createQueryContext({});

    await getRecentProducts(harness.context as never);

    expect(sortSpy).toHaveBeenCalledWith({ createdAt: -1 });
    expect(limitSpy).toHaveBeenCalledWith(8);
    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual({ success: true, data: products });
  });

  test('honors a custom limit', async () => {
    const { limitSpy, query } = createSortLimitQuery([]);
    Product.find = mock(() => query) as unknown as typeof Product.find;

    const harness = createQueryContext({ limit: 3 });

    await getRecentProducts(harness.context as never);

    expect(limitSpy).toHaveBeenCalledWith(3);
  });

  test('returns a 500 when the lookup fails', async () => {
    Product.find = mock(() => {
      throw new Error('db down');
    }) as unknown as typeof Product.find;

    const harness = createQueryContext({});

    await getRecentProducts(harness.context as never);

    expect(harness.statusCode).toBe(500);
    expect(harness.payload).toEqual({ success: false, message: 'db down' });
  });
});

describe('createProduct controller', () => {
  test('creates the product and records an audit log, skipping stock movement when stock is 0', async () => {
    const created = { _id: 'prod_new', name: 'iPad Air', stock: 0 };
    Product.create = mock(() => Promise.resolve(created)) as unknown as typeof Product.create;
    const auditCreate = mockAuditLog();

    const harness = createJsonContext({ name: 'iPad Air', stock: 0 }, 'admin_1');

    await createProduct(harness.context as never);

    expect(auditCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'admin_1',
      action: 'product.create',
      resourceType: 'Product',
      resourceId: 'prod_new',
    }));
    expect(harness.statusCode).toBe(201);
    expect(harness.payload).toEqual({ success: true, data: created });
  });
});

describe('updateProduct controller', () => {
  test('updates the product and records an audit log', async () => {
    const previousProduct = { _id: 'prod_1', price: 500, stock: 4 };
    const updatedProduct = { _id: 'prod_1', name: 'Nuevo nombre', price: 500, stock: 4 };

    Product.findById = mock(() => Promise.resolve(previousProduct)) as typeof Product.findById;
    Product.findByIdAndUpdate = mock(() => Promise.resolve(updatedProduct)) as typeof Product.findByIdAndUpdate;
    const auditCreate = mockAuditLog();

    const harness = createParamAndQueryContext('prod_1', { name: 'Nuevo nombre' }, 'admin_1');

    await updateProduct(harness.context as never);

    expect(auditCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'admin_1',
      action: 'product.update',
      resourceType: 'Product',
      resourceId: 'prod_1',
      metadata: { changes: { name: 'Nuevo nombre' } },
    }));
    expect(harness.statusCode).toBe(200);
    expect(harness.payload).toEqual({ success: true, data: updatedProduct });
  });
});
