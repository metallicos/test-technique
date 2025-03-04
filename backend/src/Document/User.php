<?php
namespace App\Document;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

#[ODM\Document]
#[ApiResource(
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']],
    operations: [
        new Post(),
        new Patch(),
        new Put(
            uriTemplate: '/api/users/update',
        ),
        new Get(
            uriTemplate: '/api/users/me',
            read: false,
            
        ),

    ]
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ODM\Id(strategy: 'INCREMENT')]
    #[Groups(['user:read', 'article:read'])] 
    public ?string $id = null;

    #[ODM\Field(type: 'string')]
    #[Assert\NotBlank]
    #[Groups(['user:read', 'article:read'])] 
    private string $name;

    #[ODM\Field(type: 'string')]
    #[Assert\NotBlank]
    #[Assert\Email]
    #[ODM\Index(unique: true)]
    #[Groups(['user:read', 'article:read'])] 

    private string $email;

    #[ODM\Field(type: 'string')]
    private string $password;

    #[ODM\Field(type: 'bool')]
    private bool $isActive = true;

    #[ODM\Field(type: 'date')]
    private \DateTime $createdAt;

    #[ODM\Field(type: 'collection')]
    private array $roles = ['ROLE_USER'];

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    // Email (with normalization)
    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = strtolower(trim($email));
        return $this;
    }

    // Password
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }

    // Security
    public function getRoles(): array
    {
        return $this->roles;
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    public function getSalt(): ?string
    {
        return null;
    }

    public function eraseCredentials(): void
    {
        // Clear temporary sensitive data if needed
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    // Active status
    public function getIsActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): self
    {
        $this->isActive = $isActive;
        return $this;
    }

    // CreatedAt
    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }
}