import React, { useState } from 'react';
import axios from 'axios';
import { Table, Pagination, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const brandOptions = {
    0: 'ALL',
    1: 'SAMSUNG',
    2: 'APPLE',
    3: 'HUAWEI',
    4: 'SONY',
};

const categoryOptions = {
    0: 'ALL',
    1: 'TABLET',
    2: 'SMARTPHONE'
}

const colorOptions = ['ALL', 'BLUE', 'RED', 'GREEN', 'WHITE', 'PURPLE', 'SILVER']


const ProductList = () => {
    const [selectBrand, setSelectedBrand] = useState(Object.keys(brandOptions)[0]);
    const [selectCategory, setSelectCategory] = useState(Object.keys(categoryOptions)[0]);
    const [selectColor, setSelectColor] = useState(colorOptions[0]);
    const [productListResponse, setGetProductResponse] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedItems, setSelectedItems] = useState([])

    const [orderCreatedResponse, setOrderCreated] = useState(false);
    const [orderList, setOrderList] = useState([])

    const handleBrand = (event) => {
        setSelectedBrand(event.target.value);
    };

    const handleCategory = (event) => {
        setSelectCategory(event.target.value);
    };

    const handleColor = (event) => {
        setSelectColor(event.target.value);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = productListResponse?.length > 0 ? productListResponse.slice(indexOfFirstItem, indexOfLastItem) : [];

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getProductParams = {
        brandId: (Number(selectBrand) === 0) ? null : selectBrand,
        categoryId: (Number(selectCategory) === 0) ? null : selectCategory,
        color: (selectColor === 'ALL') ? null : selectColor
    }

    const handleGetProduct = () => {
        const apiUrl = 'http://localhost:3044/product/getProduct';

        axios.get(apiUrl, {
            params: { ...getProductParams },
        })
            .then(response => {
                setGetProductResponse(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    const handleToggle = (itemName) => {
        setSelectedItems((prevSelectedItems) => {
            if (prevSelectedItems.includes(itemName)) {
                return prevSelectedItems.filter((item) => item !== itemName);
            } else {
                return [...prevSelectedItems, itemName];
            }
        });
    };

    const handleCreateOrder = () => {
        const selectedData = productListResponse.filter((item) => selectedItems.includes(item.name));
        const productIds = selectedData.flatMap((key) => key.productId)
        if (productIds && productIds.length > 0) {
            const apiUrl = 'http://localhost:3044/order/create';

            axios.post(apiUrl, {
                userId: 1,
                productId: productIds
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });

            setOrderCreated(true);
        }
    };

    const handleGetOrder = () => {
        if (orderCreatedResponse) {
            const apiUrl = 'http://localhost:3044/order/getOrder';

            axios.get(apiUrl, {
                params: {
                    userId: 1
                },
            })
                .then(response => {
                    setOrderList(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    };

    return (
        <div>
            <h1>Product/order record</h1>
            <label htmlFor="enumDropdown">Select an option:</label>
            <select id="enumDropdown" value={selectBrand} onChange={handleBrand}>
                {Object.entries(brandOptions).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>
            <select id="enumDropdown" value={selectCategory} onChange={handleCategory}>
                {Object.entries(categoryOptions).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>
            <select id="enumDropdown" value={selectColor} onChange={handleColor}>
                {colorOptions.map((key) => (
                    <option key={key} value={key}>
                        {key}
                    </option>
                ))}
            </select>

            <button onClick={handleGetProduct}>Search</button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
                {productListResponse && productListResponse.length > 0 && (
                    <div>
                        <h2 style={{ textAlign: 'center' }}>API Response:</h2>
                        <Table striped bordered hover style={{ width: '100%', marginTop: '20px' }}>
                            <thead>
                                <tr>
                                    <th></th> { }
                                    {Object.keys(productListResponse[0]).map((key) => (
                                        <th key={key}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => (
                                    <tr key={index} className={`brand-${item.brand.toLowerCase()}`}>
                                        <td>
                                            <Button
                                                variant={selectedItems.includes(item.name) ? 'success' : 'outline-success'}
                                                onClick={() => handleToggle(item.name)}
                                            >
                                                Add
                                            </Button>
                                        </td>
                                        {Object.values(item).map((value, idx) => (
                                            <td key={idx}>{value}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Pagination
                            className="pagination-custom"
                            style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
                        >
                            {Array.from({ length: Math.ceil(productListResponse.length / itemsPerPage) }).map((_, index) => (
                                <Pagination.Item
                                    key={index + 1}
                                    active={index + 1 === currentPage}
                                    onClick={() => paginate(index + 1)}
                                >
                                    {index + 1}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                        <Button
                            variant="primary"
                            style={{ marginTop: '20px' }}
                            onClick={handleCreateOrder}
                            disabled={selectedItems.length === 0}
                        >
                            Create Order
                        </Button>
                    </div>
                )}

                {orderCreatedResponse && (
                    <div>
                        <h2 style={{ textAlign: 'center' }}>Order List:</h2>
                        <Table striped bordered hover style={{ width: '120%', marginTop: '20px' }}>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Name</th>
                                    <th>color</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderList.map((order, index) => (
                                    <tr key={index}>
                                        <td>{order.orderId}</td>
                                        <td>{order.name}</td>
                                        <td>{order.color}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Button
                            variant="primary"
                            style={{ marginTop: '20px' }}
                            onClick={handleGetOrder}
                        >
                            Get order
                        </Button>
                    </div>
                )}
            </div>
        </div >

    );
};

export default ProductList
