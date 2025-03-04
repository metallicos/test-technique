<?php

namespace App\Controller;

use App\Document\User;
use App\Repository\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Constraints\Collection;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController 
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private ValidatorInterface $validator
    ) {}

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->errorResponse('Invalid JSON', Response::HTTP_BAD_REQUEST);
        }

        $constraints = new Collection([
            'email'    => [new Assert\NotBlank(), new Assert\Email()],
            'password' => [new Assert\NotBlank(), new Assert\Length(['min' => 6])],
            'name'     => [new Assert\NotBlank(), new Assert\Length(['min' => 2, 'max' => 50])],
        ]);

        $errors = $this->validator->validate($data, $constraints);
        if (count($errors) > 0) {
            return $this->validationErrorResponse($errors);
        }
        
        if ($this->userRepository->emailExists($data['email'])) {
            return $this->errorResponse('Email already exists', Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($data['email'])
             ->setName($data['name'])
             ->setPassword($this->passwordHasher->hashPassword($user, $data['password']));

        $dm = $this->userRepository->getDocumentManager();
        $dm->persist($user);
        $dm->flush();

        return new JsonResponse([
            'token' => $this->jwtManager->create($user),
            'user'  => $this->formatUser($user),
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login()
    {
        // managed by jwt
    }

    
    private function formatUser(User $user): array
    {
        return [
            'id'    => $user->getId(),
            'email' => $user->getEmail(),
            'name'  => $user->getName(),
            'roles' => $user->getRoles(),
        ];
    }

    private function validationErrorResponse($errors): JsonResponse
    {
        $messages = [];
        foreach ($errors as $error) {
            $messages[$error->getPropertyPath()] = $error->getMessage();
        }
        return new JsonResponse([
            'error' => [
                'code'    => Response::HTTP_BAD_REQUEST,
                'message' => 'Validation failed',
                'details' => $messages,
            ],
        ], Response::HTTP_BAD_REQUEST);
    }

    private function errorResponse(string $message, int $status): JsonResponse
    {
        return new JsonResponse([
            'error' => [
                'code'    => $status,
                'message' => $message,
            ],
        ], $status);
    }
}
