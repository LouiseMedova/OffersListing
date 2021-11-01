// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;
import './Tokens.sol';

contract OffersListing {

    address public addressTokens;
    mapping (uint => mapping (uint => Order[])) public orders;

    enum Direction{
        OFFER,
        LISTING
    }

    struct Order {
        address payable collector;
        uint tokenId;
        uint price;
        uint restAmount;
    }

    event Bid (
        address buyer,
        uint tokenId,
        uint price,
        uint amount
    );

    event Sale (
        address seller,
        uint tokenId,
        uint price,
        uint amount
    );

    constructor (address _addressTokens) {
        addressTokens = _addressTokens;
    }

    receive() external payable {}

    function Offer(
        uint _tokenId,
        uint _amount,
        uint _price
    ) external payable {
        require(msg.value >= _amount * _price, 'Not enough ether');
        Order[] storage sales = orders[_tokenId][1];
        uint len = sales.length;
        uint rest = _amount;
        while (len > 0 && rest > 0) {
            if(_price < sales[len-1].price) {
                break;
            }
            if( rest >= sales[len-1].restAmount) {
                sales[len-1].collector.transfer(sales[len-1].restAmount * _price);
                Tokens(addressTokens).safeTransferFrom(
                    sales[len-1].collector, 
                    msg.sender, 
                    _tokenId, 
                    sales[len-1].restAmount, 
                    "");
                rest -= sales[len-1].restAmount;
                sales.pop();
            } else {
                sales[len-1].collector.transfer(rest * _price);
                Tokens(addressTokens).safeTransferFrom(
                    sales[len-1].collector, 
                    msg.sender, 
                    _tokenId, 
                    rest , 
                    "");
                sales[len-1].restAmount -= rest;
                rest = 0;
            }
            len--;
        }
    
        if ( rest > 0 ) {
            Order[] storage bids = orders[_tokenId][0];
            bids.push(Order(
                payable(msg.sender),
                _tokenId,
                _price,
                rest
            ));
            len = bids.length;
            while(len > 1) {
                if(bids[len-1].price > bids[len-2].price) {
                    break;
                }
                Order memory bid = bids[len-1];
                bids[len-1] = bids[len-2];
                bids[len-2] = bid;
                len--;
            }
            emit Bid(
                msg.sender,
                _tokenId,
                _price,
                rest
            );
        }       
    }

    function Listing(
        uint _tokenId,
        uint _amount,
        uint _price
    ) external {
        Order[] storage bids = orders[_tokenId][0];
        uint len = bids.length;
        uint rest = _amount;

        while (len > 0 && rest > 0) {
            if(_price > bids[len-1].price) {
                break;
            }
            if( rest >= bids[len-1].restAmount) {
                payable(msg.sender).transfer(bids[len-1].restAmount * bids[len-1].price);
                Tokens(addressTokens).safeTransferFrom(
                    msg.sender, 
                    bids[len-1].collector, 
                    _tokenId, 
                    bids[len-1].restAmount, 
                    "");
                rest -= bids[len-1].restAmount;
                bids.pop();
            } else {
                payable(msg.sender).transfer(rest * bids[len-1].price);
                Tokens(addressTokens).safeTransferFrom(
                    msg.sender, 
                    bids[len-1].collector, 
                    _tokenId, 
                    rest, 
                    "");
                bids[len-1].restAmount -= rest;
                rest = 0;
            }
            len--;
        }

        if ( rest > 0 ) {
            Order[] storage sales = orders[_tokenId][1];
            sales.push(Order(
                payable(msg.sender),
                _tokenId,
                _price,
                rest
            ));
            len = sales.length;
            while(len > 1) {
                if(sales[len-1].price < sales[len-2].price) {
                    break;
                }
                Order memory sale = sales[len-1];
                sales[len-1] = sales[len-2];
                sales[len-2] = sale;
                len--;
            }
            emit Sale (
                msg.sender,
                _tokenId,
                _price,
                rest
            );
        }
    }

    function getCurrentBids(uint _tokenId) external view returns(Order[] memory) {
        return orders[_tokenId][0];
    }

    function getCurrentSales(uint _tokenId) external view returns(Order[] memory) {
        return orders[_tokenId][1];
    }
}
