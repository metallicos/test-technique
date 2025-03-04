<?php
namespace App\Document;

use App\Document\User;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Symfony\Component\Serializer\Attribute\Groups;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

#[MongoDB\Document]
#[ApiResource(
    normalizationContext: ['groups' => ['article:read']],
    denormalizationContext: ['groups' => ['article:write']],
    operations: [
        new Get(),
        new GetCollection(),
        new Post(security: "is_granted('ROLE_USER')"),
        new Patch(security: "is_granted('ROLE_USER')"),
        new Delete(security: "is_granted('ROLE_USER') and object.author?.id == user.id"),
        new Get(
            routePrefix: 'api_articles_me',
            read: false,
        ),
    ],

)]
class Article
{
    #[ODM\Id(strategy: 'INCREMENT')]
    #[Groups(['article:read'])]
    private ?int $id = null;

    #[MongoDB\Field]
    #[Assert\NotBlank]
    #[Groups(['article:read', 'article:write'])]
    private string $title;

    #[MongoDB\Field]
    #[Assert\NotBlank]
    #[Groups(['article:read', 'article:write'])]
    private string $content;

    #[MongoDB\ReferenceOne(targetDocument: User::class, storeAs: 'id')]
    #[Groups(['article:read','article:write'])]
    public ?User $author = null;

    #[MongoDB\Field(type: 'date')]
    #[Groups(['article:read'])]
    private \DateTimeInterface $publicationDate;

    public function __construct()
    {
        $this->publicationDate = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;
        return $this;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;
        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(User $author): self
    {
        $this->author = $author;
        return $this;
    }

    public function getPublicationDate(): \DateTime
    {
        return $this->publicationDate;
    }

    public function setPublicationDate(\DateTime $publicationDate): self
    {
        $this->publicationDate = $publicationDate;
        return $this;
    }
}
