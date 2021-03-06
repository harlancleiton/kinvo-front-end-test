import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { isAfter, isBefore, parse } from 'date-fns';

import {
  Pagination as PaginationType,
  PaginationHandler
} from '../../../@types/Pagination';
import { SnapshotByProduct } from '../../../@types/SnapshotByProduct';
import searchIcon from '../../../assets/search_icon.svg';
import { Input, Select, SelectChangeHandler } from '../../../components';
import { Pagination } from '../../../components/Pagination';
import { debounce } from '../../../utils';
import { ProductItem } from './ProductItem';
import { Container, ProductsContainer, TitleContainer } from './styles';

type ProductSortStrategy = (products: SnapshotByProduct[]) => void;

interface ProductsProps {
  snapshotByProduct: SnapshotByProduct[];
}

export const Products: React.FC<ProductsProps> = ({ snapshotByProduct }) => {
  const [productsToBePaginated, setProductsToBePaginated] = useState<
    SnapshotByProduct[]
  >(() => [...snapshotByProduct]);

  const [pagination, setPagination] = useState<PaginationType>();
  const [orderBy, setOrderBy] = useState('');

  useEffect(() => {
    setPagination({
      page: 1,
      size: 5,
      take:
        productsToBePaginated.length >= 5 ? 5 : productsToBePaginated.length,
      total: productsToBePaginated.length,
      skip: 0
    });
  }, [productsToBePaginated]);

  const pageProducts = useMemo<SnapshotByProduct[]>(() => {
    if (pagination) {
      const products = [...productsToBePaginated];
      const newPageProducts = products.splice(pagination.skip, pagination.take);

      return newPageProducts;
    }

    return [];
  }, [pagination, productsToBePaginated]);

  const handlePageChange = useCallback<PaginationHandler>(
    options => {
      const { page } = options;

      setPagination(state => {
        if (!state) return undefined;

        const newPagination = { ...state };

        newPagination.page = page;
        newPagination.skip = newPagination.size * (page - 1);
        newPagination.take = productsToBePaginated.length - newPagination.skip;
        if (newPagination.take > newPagination.size)
          newPagination.take = newPagination.size;

        return newPagination;
      });
    },
    [productsToBePaginated]
  );

  const nameSortStrategy = useCallback<ProductSortStrategy>(products => {
    products.sort((a, b) => {
      if (a.fixedIncome.name < b.fixedIncome.name) return -1;
      if (a.fixedIncome.name > b.fixedIncome.name) return 1;

      return 0;
    });
  }, []);

  const dueDateSortStrategy = useCallback<ProductSortStrategy>(products => {
    products.sort((a, b) => {
      const parsedDateA = parse(a.due.date, 'dd/MM/yyyy', new Date());
      const parsedDateB = parse(b.due.date, 'dd/MM/yyyy', new Date());

      if (isBefore(parsedDateA, parsedDateB)) return -1;
      if (isAfter(parsedDateA, parsedDateB)) return 1;

      return 0;
    });
  }, []);

  const valueAppliedSortStrategy = useCallback<ProductSortStrategy>(
    products => {
      products.sort((a, b) => {
        if (a.position.valueApplied < b.position.valueApplied) return -1;
        if (a.position.valueApplied > b.position.valueApplied) return 1;

        return 0;
      });
    },
    []
  );

  const sortProducts = useCallback(() => {
    let sortStrategy: ProductSortStrategy;

    switch (orderBy) {
      case 'name':
        sortStrategy = nameSortStrategy;
        break;
      case 'valueApplied':
        sortStrategy = valueAppliedSortStrategy;
        break;
      case 'dueDate':
        sortStrategy = dueDateSortStrategy;
        break;
      default:
        return;
    }

    setProductsToBePaginated(state => {
      const newProductsToBePaginated = [...state];

      sortStrategy(newProductsToBePaginated);

      return newProductsToBePaginated;
    });
  }, [
    dueDateSortStrategy,
    nameSortStrategy,
    orderBy,
    valueAppliedSortStrategy
  ]);

  useEffect(() => {
    sortProducts();
  }, [sortProducts]);

  const handleInputTextChange = useCallback(
    (inputText: string) => {
      let newPageProducts = [...snapshotByProduct];

      if (inputText !== '') {
        newPageProducts = newPageProducts.filter(product => {
          const productName = product.fixedIncome.name.toLowerCase();

          return productName.includes(inputText.toLowerCase());
        });
      }

      setProductsToBePaginated(newPageProducts);
      sortProducts();
    },
    [snapshotByProduct, sortProducts]
  );

  const handleSelectChange = useCallback<SelectChangeHandler>(valueSelected => {
    setOrderBy(valueSelected.value);
  }, []);

  return (
    <Container>
      <TitleContainer>
        <h3>Minhas Rendas Fixas</h3>

        <div>
          <Select
            onChange={handleSelectChange}
            placeholder="Ordernar Por"
            options={[
              { label: 'Nome', value: 'name' },
              { label: 'Valor Inves.', value: 'valueApplied' },
              { label: 'Data Venc.', value: 'dueDate' }
            ]}
          />

          <Input
            onTextChange={debounce(handleInputTextChange, 500)}
            leftIcon={searchIcon}
          />
        </div>
      </TitleContainer>

      <ProductsContainer>
        {pageProducts.map((product, index) => (
          <ProductItem
            key={product.fixedIncome.name}
            product={product}
            invert={index % 2 !== 0}
          />
        ))}
      </ProductsContainer>

      {pagination && (
        <Pagination pagination={pagination} onChange={handlePageChange} />
      )}
    </Container>
  );
};
