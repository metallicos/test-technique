<?php
namespace App\Controller;

use App\Document\User;
use App\Document\Article;
use App\Repository\ArticleRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ArticleController extends AbstractController
{

    public function __construct(
        private ArticleRepository $articleRepository,
        private DocumentManager $dm
    ) {
    }
    #[Route('/articles/me', name: 'api_articles_me', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function me(
        #[CurrentUser] User $user,
        ArticleRepository $articleRepository,
        Request $request
    ): JsonResponse {

        $page  = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 5);

        $paginator = $articleRepository->findArticlesByUser($user, $page, $limit);

        return $this->json([
            'data' => $paginator['results'],
            'pagination' => [
                'current_page' => $page,
                'total_pages'  => $paginator['total_pages'],
                'total_items'  => $paginator['total_items'],
            ],
        ]);

    }

    #[Route('/api/articles/create', methods: ['POST'])]
    public function create(Request $request, ValidatorInterface $validator): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        /** @var User $user */
        $user = $this->getUser();
        if (! $user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $article = new Article();
        $article->setTitle($data['title'] ?? '')
            ->setContent($data['content'] ?? '')
            ->setAuthor($user);

        // Validation
        $errors = $validator->validate($article);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->dm->persist($article);
        $this->dm->flush();

        return $this->json(
            $this->formatArticle($article),
            Response::HTTP_CREATED
        );
    }



    private function formatArticle(Article $article): array
    {
        return [
            'id'              => $article->getId(),
            'title'           => $article->getTitle(),
            'content'         => $article->getContent(),
            'author'          => $article->getAuthor()->getUserIdentifier(),
            'publicationDate' => $article->getPublicationDate()->format(\DateTimeInterface::ATOM),
        ];
    }
}
