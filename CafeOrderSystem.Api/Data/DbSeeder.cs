using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CafeOrderSystem.Api.Models;

namespace CafeOrderSystem.Api.Data
{
    public static class DbSeeder
    {
        public static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = new[] { "Admin", "Customer" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }
        public static async Task SeedAdminAsync(UserManager<IdentityUser> userManager)
        {
            string adminUserName = "admin1";
            string adminEmail = "admin1@example.com";
            string adminPassword = "1qaz@WSX";

            var existingAdmin = await userManager.FindByNameAsync(adminUserName);
            if (existingAdmin == null)
            {
                var admin = new IdentityUser
                {
                    UserName = adminUserName,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(admin, adminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
                else
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new Exception($"Failed to create admin user: {errors}");
                }
            }
        }

        public static async Task SeedProductsAsync(AppDbContext context)
        {
            if (await context.Products.AnyAsync()) return;

            var products = new List<Product>
            {
                new Product { Name = "Americano", Description = "Classic black coffee", Category = "Beverage", Price = 4.0m, ImageUrl = "/images/Americano.jpg" },
                new Product { Name = "Latte", Description = "Espresso with steamed milk", Category = "Beverage", Price = 5.0m, ImageUrl = "/images/Latte.jpg" },
                new Product { Name = "Cappuccino", Description = "Espresso with foamed milk", Category = "Beverage", Price = 5.0m, ImageUrl = "/images/Cappuccino.jpg" },
                new Product { Name = "Espresso", Description = "Strong black coffee", Category = "Beverage", Price = 3.0m, ImageUrl = "/images/Espresso.jpg" },
                new Product { Name = "Mocha", Description = "Chocolate flavored latte", Category = "Beverage", Price = 5.5m, ImageUrl = "/images/Mocha.jpg" },
                new Product { Name = "Cheesecake", Description = "Creamy cheesecake slice", Category = "Dessert", Price = 6.0m, ImageUrl = "/images/Cheesecake.jpg" },
                new Product { Name = "Chocolate Cake", Description = "Rich chocolate cake slice", Category = "Dessert", Price = 6.0m, ImageUrl = "/images/ChocolateCake.jpg" },
                new Product { Name = "Croissant", Description = "Buttery flaky pastry", Category = "Pastry", Price = 3.5m, ImageUrl = "/images/Croissant.jpg" },
                new Product { Name = "Bagel", Description = "Fresh baked bagel", Category = "Pastry", Price = 3.0m, ImageUrl = "/images/Bagel.jpg" },
                new Product { Name = "Muffin", Description = "Blueberry muffin", Category = "Pastry", Price = 3.5m, ImageUrl = "/images/Muffin.jpg" }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }

    }
}
