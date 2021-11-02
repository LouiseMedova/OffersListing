// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import './Tokens.sol';

contract OffersListing is ReentrancyGuard {

    struct Order {
        address nft;
        uint tokenId;
        address payable collector;
        uint price;
        uint restAmount;
    }

    event Bid (
        address buyer,
        uint tokenId,
        address nft,
        uint price,
        uint amount
    );

    event Sale (
        address seller,
        uint tokenId,
        address nft,
        uint price,
        uint amount
    );

    Order[] public bids;
    Order[] public sales;

    receive() external payable {}

    function Offer(
        address _nft,
        uint _tokenId,
        uint _amount,
        uint _price
    ) nonReentrant external payable {
        require(msg.value >= _amount * _price, 'not enough ether');
        uint rest = _amount;
        for(uint i = 0; i < sales.length; i++) {
            uint saleAmount;
            if(sales[i].nft == _nft && sales[i].tokenId == _tokenId && sales[i].price <= _price && sales[i].restAmount > 0) {
                saleAmount = rest >= sales[i].restAmount ? sales[i].restAmount : rest;
                sales[i].restAmount =  rest >= sales[i].restAmount ?  0 : sales[i].restAmount - rest;
                Tokens(sales[i].nft).safeTransferFrom(
                    sales[i].collector, 
                    msg.sender, 
                    sales[i].tokenId, 
                    saleAmount, 
                    "");
                (bool sent, ) = sales[i].collector.call{value: saleAmount * _price}("");
                require(sent, "Failed to send Ether");
                rest = rest >= saleAmount ? rest - saleAmount : 0;
            }
            if(rest == 0) {
                break;
            }
        }
        if (rest > 0) {
            bids.push(Order(
                _nft,
                _tokenId,
                payable(msg.sender),
                _price,
                rest
            ));
            emit Bid(
                 msg.sender,
                 _tokenId,
                 _nft,
                 _price,
                 rest
            );
        }       
    }

    function Listing(
        address _nft,
        uint _tokenId,
        uint _amount,
        uint _price
    ) nonReentrant external {
        uint rest = _amount;
        for(uint i = 0; i < bids.length; i++) {
            uint bidAmount;
            if(bids[i].nft == _nft && bids[i].tokenId == _tokenId && bids[i].price >= _price && bids[i].restAmount > 0) {
                    bidAmount = rest >= bids[i].restAmount ? bids[i].restAmount : rest;
                    bids[i].restAmount = rest >= bids[i].restAmount ? 0 : bids[i].restAmount - rest; 
                    Tokens(bids[i].nft).safeTransferFrom(
                        msg.sender,
                        bids[i].collector, 
                        bids[i].tokenId, 
                        bidAmount, 
                        "");
                    (bool sent, ) = payable(msg.sender).call{value: bidAmount * _price}("");
                    require(sent, "Failed to send Ether");
                    rest = rest >= bidAmount ? rest - bidAmount : 0;
            }
            if(rest == 0) {
                break;
            }
        }
        if (rest > 0) {
            sales.push(Order(
                _nft,
                _tokenId,
                payable(msg.sender),
                _price,
                rest
            ));
            emit Sale(
                 msg.sender,
                 _tokenId,
                 _nft,
                 _price,
                 rest
            );
        }
    }

    function getCurrentBids(address _nft) external view returns(Order[] memory) {
        uint len;
        for(uint i = 0; i < bids.length; i++) {
            if(bids[i].nft == _nft) {
                len++;
            }
        }
        uint j;
        Order[] memory _bids = new Order[](len);
        for(uint i = 0; i < bids.length; i++) {
            if(bids[i].nft == _nft) {
                _bids[j] = bids[i];
                j++;
            }
        }
        return _bids;
    }

    function getCurrentSales(address _nft) external view returns(Order[] memory) {
       uint len;
        for(uint i = 0; i < sales.length; i++) {
            if(sales[i].nft == _nft) {
                len++;
            }
        }
        uint j;
        Order[] memory _sales = new Order[](len);
        for(uint i = 0; i < sales.length; i++) {
            if(sales[i].nft == _nft) {
                _sales[j] = sales[i];
                j++;
            }
        }
        return _sales;
    }
}
