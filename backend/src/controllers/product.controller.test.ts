import { afterEach, describe, expect, mock, test } from 'bun:test';
import { deleteProduct } from './product.controller';
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
