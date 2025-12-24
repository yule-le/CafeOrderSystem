using CafeOrderSystem.Api.Data;
using CafeOrderSystem.Api.DTOs;
using CafeOrderSystem.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CafeOrderSystem.Api.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;

        public CartService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CartDto> GetCartAsync(string userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return new CartDto();

            return new CartDto
            {
                Id = cart.Id,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    Price = i.Product.Price,
                    Quantity = i.Quantity,
                    ImageUrl = i.Product.ImageUrl
                }).ToList()
            };
        }

        public async Task AddItemAsync(string userId, AddCartItemDto dto)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
            }

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity += dto.Quantity;
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<CartItemDto> UpdateItemAsync(string userId, int cartitemId, UpdateCartItemDto dto)
        {
            var item = await _context.CartItems
                .Include(i => i.Cart)
                .Include(i => i.Product)
                .FirstOrDefaultAsync(i => i.Id == cartitemId && i.Cart.UserId == userId);

            if (item == null) throw new Exception("Item not found");

            item.Quantity = dto.Quantity;
            await _context.SaveChangesAsync();

            return new CartItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                Price = item.Product.Price,
                Quantity = item.Quantity,
                ImageUrl = item.Product.ImageUrl
            };
        }


        public async Task RemoveItemAsync(string userId, int itemId)
        {
            var item = await _context.CartItems
                .Include(i => i.Cart)
                .FirstOrDefaultAsync(i => i.Id == itemId && i.Cart.UserId == userId);

            if (item == null) throw new Exception("Item not found");

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }

        public async Task ClearCartAsync(Cart cart)
        {
            _context.CartItems.RemoveRange(cart.Items);
            await _context.SaveChangesAsync();
        }
    }
}
