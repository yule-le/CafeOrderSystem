using CafeOrderSystem.Api.DTOs;
using FluentValidation;

namespace CafeOrderSystem.Api.Validators
{
    public class RegisterDtoValidator : AbstractValidator<RegisterDto>
    {
        public RegisterDtoValidator()
        {
            RuleFor(x => x.Username)
            .NotEmpty()
            .MinimumLength(4)
            .MaximumLength(50);

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(6)
                .MaximumLength(100);
        }
    }
}
