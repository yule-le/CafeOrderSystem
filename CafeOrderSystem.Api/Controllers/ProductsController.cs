using CafeOrderSystem.Api.Data;
using CafeOrderSystem.Api.DTOs;
using CafeOrderSystem.Api.Models;
using CafeOrderSystem.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CafeOrderSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;

        public ProductsController(IProductService service)
        {
            _service = service;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<ProductDto>> GetProducts()
        {
            var products = await _service.GetAllAsync();
            if (products == null)
            {
                return NotFound(new 
                { 
                    success = false, 
                    message = "Product not found" }
                );
            }

            return Ok(new
            {
                success = true,
                data = products
            });
        }

        // GET: api/products/id
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetById(int id)
        {
            var product = await _service.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Product with ID {id} not found",
                    id = id
                });
            }
            return Ok(new
            {
                success = true,
                data = product
            });
        }

        // POST: api/products
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ProductDto>> Create(CreateProductDto dto)
        {
            var product = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, new
            {
                success = true,
                data = product,
                message = $"Product with ID {product.Id} created successfully"
            });
        }

        // PUT: api/products/id
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateProductDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
            if (!success)
                return NotFound(new
                {
                    success = false,
                    message = $"Product with ID {id} not found",
                    id = id
                });

            return Ok(new
            {
                success = true,
                message = $"Product with ID {id} updated successfully",
                id = id
            });
        }

        // DELETE: api/products/id
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Product with ID {id} not found",
                    id = id
                });
            }

            return Ok(new
            {
                success = true,
                message = $"Product with ID {id} deleted successfully",
                id = id
            });
        }


    }
}
